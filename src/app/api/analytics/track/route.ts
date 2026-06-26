import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ALLOWED_EVENT_TYPES = new Set([
  "clic_alojamiento",
  "clic_contacto",
  "clic_reserva_termas",
])

type TrackBody = {
  event_type?: unknown
  target_id?: unknown
}

function getRlsSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function clamp(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value
}

export async function POST(req: Request) {
  try {
    const supabase = getRlsSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as TrackBody | null
    const eventType =
      typeof body?.event_type === "string" ? clamp(body.event_type.trim(), 80) : ""
    const targetIdRaw = typeof body?.target_id === "string" ? body.target_id.trim() : ""
    const targetId = targetIdRaw ? clamp(targetIdRaw, 200) : null

    if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ ok: false, error: "Evento inválido" }, { status: 400 })
    }

    const { error } = await supabase.from("analytics_events").insert([
      {
        event_type: eventType,
        target_id: targetId,
      },
    ])

    if (error) {
      console.error("analytics_events insert error:", error)
      return NextResponse.json({ ok: false, error: "No se pudo registrar el evento" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
