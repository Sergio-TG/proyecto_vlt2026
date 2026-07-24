import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { getServerSupabase } from "@/lib/supabase-server"

type AnalyticsRow = {
  event_type: string
  target_id: string | null
  created_at: string
}

const PAGE_SIZE = 1000
const MAX_ROWS = 50000

function escapeCsv(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function csvLine(cells: Array<string | number | null | undefined>): string {
  return cells.map((cell) => escapeCsv(cell == null ? "" : String(cell))).join(";")
}

function sortCounts(map: Map<string, number>): Array<[string, number]> {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

async function fetchAllEvents(): Promise<{ rows: AnalyticsRow[]; error: string | null }> {
  const supabase = getServerSupabase()
  if (!supabase) return { rows: [], error: "Configuración del servidor incompleta." }

  const rows: AnalyticsRow[] = []
  let from = 0

  while (from < MAX_ROWS) {
    const to = Math.min(from + PAGE_SIZE - 1, MAX_ROWS - 1)
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("analytics export fetch error:", error)
      return { rows: [], error: error.message || "No se pudieron leer los eventos." }
    }

    const batch = (data || []) as unknown as AnalyticsRow[]
    rows.push(...batch)

    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return { rows, error: null }
}

function buildCsv(rows: AnalyticsRow[]): string {
  const typeCounts = new Map<string, number>()
  const clickCounts = new Map<string, number>()
  const viewInterestCounts = new Map<string, number>()
  const serviceCounts = new Map<string, number>()

  let totalAlojamientos = 0
  let totalContacto = 0
  let totalReservaTermas = 0
  let totalPageViews = 0
  let totalServiceInterest = 0

  for (const row of rows) {
    const eventType = typeof row.event_type === "string" ? row.event_type.trim() : ""
    const targetId = typeof row.target_id === "string" ? row.target_id.trim() : ""
    if (!eventType) continue

    typeCounts.set(eventType, (typeCounts.get(eventType) || 0) + 1)

    if (eventType === "page_view") {
      totalPageViews += 1
      if (targetId) viewInterestCounts.set(targetId, (viewInterestCounts.get(targetId) || 0) + 1)
    } else if (eventType === "service_interest") {
      totalServiceInterest += 1
      if (targetId) serviceCounts.set(targetId, (serviceCounts.get(targetId) || 0) + 1)
    } else if (eventType === "clic_alojamiento") {
      totalAlojamientos += 1
      if (targetId) {
        clickCounts.set(targetId, (clickCounts.get(targetId) || 0) + 1)
        viewInterestCounts.set(targetId, (viewInterestCounts.get(targetId) || 0) + 1)
      }
    } else if (eventType === "clic_contacto") {
      totalContacto += 1
    } else if (eventType === "clic_reserva_termas") {
      totalReservaTermas += 1
    }
  }

  const exportedAt = new Date().toISOString()
  const lines: string[] = []
  const isTestKey = (key: string) => key.startsWith("test-")

  lines.push(csvLine(["seccion", "campo", "valor", "extra"]))
  lines.push(csvLine(["Resumen", "exportado_en", exportedAt, ""]))
  lines.push(csvLine(["Resumen", "total_eventos", rows.length, ""]))
  lines.push(csvLine(["Resumen", "clics_alojamientos", totalAlojamientos, ""]))
  lines.push(csvLine(["Resumen", "formularios_contacto", totalContacto, ""]))
  lines.push(csvLine(["Resumen", "reservas_termas", totalReservaTermas, ""]))
  lines.push(csvLine(["Resumen", "vistas_ficha", totalPageViews, ""]))
  lines.push(csvLine(["Resumen", "interes_servicios", totalServiceInterest, ""]))
  lines.push("")

  lines.push(csvLine(["seccion", "event_type", "cantidad", ""]))
  for (const [eventType, count] of sortCounts(typeCounts)) {
    lines.push(csvLine(["Por tipo de evento", eventType, count, ""]))
  }
  lines.push("")

  lines.push(csvLine(["seccion", "alojamiento", "cantidad", ""]))
  for (const [key, count] of sortCounts(clickCounts)) {
    if (isTestKey(key)) continue
    lines.push(csvLine(["Top clics alojamientos", key, count, ""]))
  }
  lines.push("")

  lines.push(csvLine(["seccion", "alojamiento", "cantidad", ""]))
  for (const [key, count] of sortCounts(viewInterestCounts)) {
    if (isTestKey(key)) continue
    lines.push(csvLine(["Top vistas / interés", key, count, ""]))
  }
  lines.push("")

  lines.push(csvLine(["seccion", "servicio", "cantidad", ""]))
  for (const [key, count] of sortCounts(serviceCounts)) {
    lines.push(csvLine(["Top servicios consultados", key, count, ""]))
  }
  lines.push("")

  lines.push(csvLine(["seccion", "event_type", "target_id", "created_at"]))
  for (const row of rows) {
    lines.push(
      csvLine([
        "Eventos detalle",
        row.event_type ?? "",
        row.target_id ?? "",
        row.created_at ?? "",
      ]),
    )
  }

  // BOM para que Excel abra bien tildes/ñ en español
  return `\uFEFF${lines.join("\r\n")}\r\n`
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req)
  } catch (e) {
    if (e instanceof NextResponse) return e
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 })
  }

  const { rows, error } = await fetchAllEvents()
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  const csv = buildCsv(rows)
  const stamp = new Date().toISOString().slice(0, 10)
  const filename = `analytics-vivi-las-termas-${stamp}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
