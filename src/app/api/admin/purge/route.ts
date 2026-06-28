import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import { eliminarAlojamientoDefinitivo } from "@/lib/supabase-queries"

export async function POST(req: Request) {
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

    const body = (await req.json()) as { approvedId?: string }
    const approvedId = typeof body.approvedId === "string" ? body.approvedId.trim() : ""
    if (!approvedId) {
      return NextResponse.json({ ok: false, error: "approvedId requerido" }, { status: 400 })
    }

    const result = await eliminarAlojamientoDefinitivo(supabase, approvedId)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
