import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"

type SavePendingBody = {
  record?: Record<string, unknown>
  editingId?: string | null
}

export async function POST(req: Request) {
  try {
    const supabaseService = getServerSupabase()
    if (!supabaseService) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : ""
    if (!token) {
      return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseService.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 })
    }

    const body = (await req.json()) as SavePendingBody
    const recordInput = body?.record
    const editingId = body?.editingId ?? null
    if (!recordInput || typeof recordInput !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid record" }, { status: 400 })
    }

    const slug = typeof recordInput.slug === "string" ? recordInput.slug.trim() : ""
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 })
    }

    const authedUserId = userData.user.id
    const safeRecord: Record<string, unknown> = { ...recordInput, user_id: authedUserId, slug }

    if (typeof recordInput.user_id === "string" && recordInput.user_id !== authedUserId) {
      return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 })
    }

    const updateById = async (id: string) => {
      const { data, error } = await supabaseService
        .from("alojamientos_pendientes")
        .update(safeRecord)
        .eq("id", id)
        .eq("user_id", authedUserId)
        .select("id")
        .limit(1)
      return { data, error }
    }

    if (editingId) {
      const { data, error } = await updateById(editingId)
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }
      if (data && data.length > 0) {
        return NextResponse.json({ ok: true, id: data[0].id })
      }
    }

    const { data: existing, error: findErr } = await supabaseService
      .from("alojamientos_pendientes")
      .select("id")
      .eq("user_id", authedUserId)
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(1)

    if (findErr) {
      return NextResponse.json({ ok: false, error: findErr.message }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      const { data, error } = await updateById(existing[0].id)
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }
      if (!data || data.length === 0) {
        return NextResponse.json(
          { ok: false, error: "No se pudo guardar la actualización. Volvé a intentar." },
          { status: 500 }
        )
      }
      return NextResponse.json({ ok: true, id: data[0].id })
    }

    const { data: inserted, error: insertErr } = await supabaseService
      .from("alojamientos_pendientes")
      .insert([safeRecord])
      .select("id")
      .limit(1)

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 })
    }
    if (!inserted || inserted.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar la actualización. Volvé a intentar." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: inserted[0].id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

