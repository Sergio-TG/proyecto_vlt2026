import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"

export async function GET(req: Request) {
  const supabase = getServerSupabase()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
  }

  try {
    await requireAdmin(req)
  } catch (e: unknown) {
    if (e instanceof Response) return e
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}

