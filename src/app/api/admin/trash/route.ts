import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import { onlyDeletedAlojamientos } from "@/lib/alojamientos-active"

export type TrashAlojamientoRow = {
  id: string
  nombre: string | null
  slug: string | null
  localidad: string | null
  deleted_at: string | null
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

    const { data, error } = await onlyDeletedAlojamientos(
      supabase
        .from("alojamientos_aprobados")
        .select("id, nombre, slug, localidad, deleted_at")
        .order("deleted_at", { ascending: false }),
    )

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const items: TrashAlojamientoRow[] = (data ?? []).map((row) => ({
      id: String(row.id),
      nombre: row.nombre == null ? null : String(row.nombre),
      slug: row.slug == null ? null : String(row.slug),
      localidad: row.localidad == null ? null : String(row.localidad),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    }))

    return NextResponse.json({ ok: true, items })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
