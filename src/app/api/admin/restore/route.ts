import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"

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

    const { error } = await supabase
      .from("alojamientos_aprobados")
      .update({ deleted_at: null })
      .eq("id", approvedId)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
