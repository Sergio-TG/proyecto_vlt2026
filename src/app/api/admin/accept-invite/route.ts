import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getServerSupabase } from "@/lib/supabase-server"

export async function GET(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    const url = new URL(req.url)
    const token = (url.searchParams.get("token") || "").trim()
    if (!token) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("admin_invitations")
      .select("token, email, expires_at, used_at")
      .eq("token", token)
      .limit(1)

    if (error || !data || data.length === 0) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    const row = data[0] as unknown as {
      email?: unknown
      expires_at?: unknown
      used_at?: unknown
    }

    const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : ""
    const expiresAt = typeof row.expires_at === "string" ? new Date(row.expires_at).getTime() : Number.NaN
    const isUsed = row.used_at != null

    if (!email || Number.isNaN(expiresAt) || isUsed || Date.now() > expiresAt) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    const redirectUrl = new URL("/admin/accept-invite", url.origin)
    redirectUrl.searchParams.set("token", token)
    redirectUrl.searchParams.set("email", email)

    return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

type AcceptInviteBody = {
  token?: unknown
  password?: unknown
}

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as AcceptInviteBody | null
    const token = typeof body?.token === "string" ? body.token.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!token || password.trim().length < 8) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
    }

    const { data: inviteRows, error: inviteErr } = await supabase
      .from("admin_invitations")
      .select("token, email, expires_at, used_at, invited_by")
      .eq("token", token)
      .limit(1)

    if (inviteErr || !inviteRows || inviteRows.length === 0) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    const invite = inviteRows[0] as unknown as {
      email?: unknown
      expires_at?: unknown
      used_at?: unknown
      invited_by?: unknown
    }

    const email = typeof invite.email === "string" ? invite.email.trim().toLowerCase() : ""
    const expiresAt = typeof invite.expires_at === "string" ? new Date(invite.expires_at).getTime() : Number.NaN
    const isUsed = invite.used_at != null
    const invitedBy = invite.invited_by == null ? null : String(invite.invited_by)

    if (!email || Number.isNaN(expiresAt) || isUsed || Date.now() > expiresAt) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    const createdUser = (created as { user?: User | null } | null)?.user ?? null
    if (createErr || !createdUser) {
      return NextResponse.json({ ok: false, error: "Registration failed" }, { status: 500 })
    }

    const createdUserId = createdUser.id

    const { error: insAdminErr } = await supabase.from("admin_users").insert([
      {
        user_id: createdUserId,
        email,
        role: "admin",
        active: true,
        invited_by: invitedBy,
      },
    ])

    if (insAdminErr) {
      await supabase.auth.admin.deleteUser(createdUserId).catch(() => null)
      return NextResponse.json({ ok: false, error: "Registration failed" }, { status: 500 })
    }

    const usedAt = new Date().toISOString()
    const { data: markRows, error: markErr } = await supabase
      .from("admin_invitations")
      .update({ used_at: usedAt })
      .eq("token", token)
      .is("used_at", null)
      .select("token")
      .limit(1)

    if (markErr || !markRows || markRows.length === 0) {
      await supabase.from("admin_users").delete().eq("user_id", createdUserId)
      await supabase.auth.admin.deleteUser(createdUserId).catch(() => null)
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
