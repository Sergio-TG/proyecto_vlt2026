import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getServerSupabase } from "@/lib/supabase-server"

export type AdminUserRecord = {
  id: string
  user_id: string
  email: string | null
  role: string | null
  active: boolean
  invited_by: string | null
  created_at: string | null
}

export async function requireAdmin(req: Request): Promise<{ user: User; adminRecord: AdminUserRecord }> {
  const supabase = getServerSupabase()
  if (!supabase) {
    throw NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
  }

  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : ""
  if (!token) {
    throw NextResponse.json({ ok: false, reason: "missing_token" }, { status: 401 })
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    throw NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 })
  }

  const user = userData.user

  const { data: adminRows, error: adminErr } = await supabase
    .from("admin_users")
    .select("id, user_id, email, role, active, invited_by, created_at")
    .eq("user_id", user.id)
    .limit(1)

  if (adminErr) {
    throw NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
  }

  const raw = adminRows && adminRows.length > 0 ? (adminRows[0] as unknown) : null
  if (!raw) {
    throw NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
  }

  const row = raw as {
    id?: unknown
    user_id?: unknown
    email?: unknown
    role?: unknown
    active?: unknown
    invited_by?: unknown
    created_at?: unknown
  }

  if (row.active !== true) {
    throw NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
  }

  const userId = String(row.user_id || "")
  if (!userId) {
    throw NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
  }

  return {
    user,
    adminRecord: {
      id: String(row.id || ""),
      user_id: userId,
      email: row.email == null ? null : String(row.email),
      role: row.role == null ? null : String(row.role),
      active: true,
      invited_by: row.invited_by == null ? null : String(row.invited_by),
      created_at: row.created_at == null ? null : String(row.created_at),
    },
  }
}
