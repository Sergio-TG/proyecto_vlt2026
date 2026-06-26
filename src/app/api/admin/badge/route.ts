import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import { isBadgeDestacadoSlug } from "@/lib/accommodation-badges"

type BadgeBody = {
  id?: unknown
  slug?: unknown
  badge_destacado?: unknown
}

export async function PATCH(req: Request) {
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

    const body = (await req.json().catch(() => null)) as BadgeBody | null
    const id = typeof body?.id === "string" ? body.id.trim() : ""
    const slug = typeof body?.slug === "string" ? body.slug.trim() : ""
    const rawBadge = body?.badge_destacado

    if (!id && !slug) {
      return NextResponse.json({ ok: false, error: "ID o slug requerido" }, { status: 400 })
    }

    let badge_destacado: string | null = null
    if (rawBadge === null || rawBadge === "") {
      badge_destacado = null
    } else if (typeof rawBadge === "string") {
      const trimmed = rawBadge.trim()
      if (trimmed && !isBadgeDestacadoSlug(trimmed)) {
        return NextResponse.json({ ok: false, error: "Badge inválido" }, { status: 400 })
      }
      badge_destacado = trimmed || null
    } else {
      return NextResponse.json({ ok: false, error: "Badge inválido" }, { status: 400 })
    }

    const query = supabase.from("alojamientos_aprobados").update({ badge_destacado })
    const { error } = id ? await query.eq("id", id) : await query.eq("slug", slug)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message || "No se pudo actualizar" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, badge_destacado })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
