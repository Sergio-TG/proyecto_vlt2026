import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import type { ReviewPendingModeration } from "@/lib/reviews"
import { normalizeReviewFotos } from "@/lib/reviews"

export async function GET(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const { data: rows, error } = await supabase
      .from("reviews")
      .select(
        "id, alojamiento_id, nombre_usuario, estrellas_alojamiento, estrellas_plataforma, comentario, fotos, created_at",
      )
      .eq("aprobada", false)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const pending = rows ?? []
    const alojamientoIds = [...new Set(pending.map((r) => String(r.alojamiento_id)).filter(Boolean))]

    let nameById: Record<string, string> = {}
    if (alojamientoIds.length > 0) {
      const { data: alojamientos } = await supabase
        .from("alojamientos_aprobados")
        .select("id, nombre")
        .in("id", alojamientoIds)

      nameById = Object.fromEntries(
        (alojamientos ?? []).map((a) => [String(a.id), String(a.nombre ?? "")]),
      )
    }

    const reviews: ReviewPendingModeration[] = pending.map((row) => ({
      id: String(row.id),
      alojamiento_id: String(row.alojamiento_id),
      nombre_usuario: String(row.nombre_usuario ?? ""),
      estrellas_alojamiento: Number(row.estrellas_alojamiento),
      estrellas_plataforma: Number(row.estrellas_plataforma),
      comentario: row.comentario == null ? null : String(row.comentario),
      fotos: normalizeReviewFotos(row.fotos),
      created_at: String(row.created_at ?? ""),
      alojamiento_nombre: nameById[String(row.alojamiento_id)] ?? null,
    }))

    return NextResponse.json({ ok: true, reviews })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
