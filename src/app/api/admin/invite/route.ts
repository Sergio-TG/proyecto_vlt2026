import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    let adminRecord
    try {
      const res = await requireAdmin(req)
      adminRecord = res.adminRecord
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const body = (await req.json().catch(() => null)) as unknown
    const emailRaw = (body as { email?: unknown } | null)?.email
    const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : ""

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 })
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: insErr } = await supabase.from("admin_invitations").insert([
      {
        token,
        email,
        invited_by: adminRecord.id,
        expires_at: expiresAt,
        used_at: null,
      },
    ])

    if (insErr) {
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
    }

    const origin = new URL(req.url).origin
    const acceptUrl = new URL("/api/admin/accept-invite", origin)
    acceptUrl.searchParams.set("token", token)

    return NextResponse.json({ ok: true, url: acceptUrl.toString() })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
