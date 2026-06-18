import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import { onlyActiveAlojamientos } from "@/lib/alojamientos-active"
import { computeReviewStats, type ReviewStats } from "@/lib/review-stats"

type AlojamientoOption = {
  id: string
  nombre: string
}

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

    const { searchParams } = new URL(req.url)
    const alojamientoId = searchParams.get("alojamientoId")?.trim() || null

    const { data: alojamientosRaw } = await onlyActiveAlojamientos(
      supabase.from("alojamientos_aprobados").select("id, nombre").order("nombre", { ascending: true }),
    )

    const alojamientos: AlojamientoOption[] = (alojamientosRaw ?? []).map((row) => ({
      id: String(row.id),
      nombre: String(row.nombre ?? "Sin nombre"),
    }))

    let query = supabase
      .from("reviews")
      .select("estrellas_alojamiento, estrellas_plataforma")
      .eq("aprobada", true)

    if (alojamientoId) {
      query = query.eq("alojamiento_id", alojamientoId)
    }

    const { data: rows, error } = await query

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const statsRows = (rows ?? []).map((row) => ({
      estrellas_alojamiento: Number(row.estrellas_alojamiento),
      estrellas_plataforma: Number(row.estrellas_plataforma),
    }))

    const stats: ReviewStats = computeReviewStats(statsRows)

    const selected = alojamientoId
      ? alojamientos.find((item) => item.id === alojamientoId) ?? null
      : null

    return NextResponse.json({
      ok: true,
      scope: alojamientoId ? "alojamiento" : "global",
      alojamientoId,
      alojamientoNombre: selected?.nombre ?? null,
      stats,
      alojamientos,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
