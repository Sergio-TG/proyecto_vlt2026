import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSupabase } from "@/lib/supabase-server"

const ALLOWED_EVENT_TYPES = new Set([
  "clic_alojamiento",
  "clic_contacto",
  "clic_reserva_termas",
  "page_view",
  "service_interest",
  "consult_agency",
  "direct_provider",
])

type TrackBody = {
  event_type?: unknown
  target_id?: unknown
}

function getAnonSupabase() {
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
    const body = (await req.json().catch(() => null)) as TrackBody | null
    const eventType =
      typeof body?.event_type === "string" ? clamp(body.event_type.trim(), 80) : ""
    const targetIdRaw = typeof body?.target_id === "string" ? body.target_id.trim() : ""
    const targetId = targetIdRaw ? clamp(targetIdRaw, 200) : null

    if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ ok: false, error: "Evento inválido" }, { status: 400 })
    }

    if (
      (eventType === "page_view" ||
        eventType === "service_interest" ||
        eventType === "consult_agency" ||
        eventType === "direct_provider") &&
      !targetId
    ) {
      return NextResponse.json({ ok: false, error: "target_id requerido" }, { status: 400 })
    }

    const row = { event_type: eventType, target_id: targetId }

    // Preferimos service role (evita fallos si falta la policy de INSERT en RLS).
    const service = getServerSupabase()
    if (service) {
      const { error } = await service.from("analytics_events").insert([row])
      if (error) {
        console.error("analytics_events insert error (service):", error)
        return NextResponse.json({ ok: false, error: "No se pudo registrar el evento" }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    const anon = getAnonSupabase()
    if (!anon) {
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
    }

    const { error } = await anon.from("analytics_events").insert([row])
    if (error) {
      console.error("analytics_events insert error (anon):", error)
      return NextResponse.json({ ok: false, error: "No se pudo registrar el evento" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
