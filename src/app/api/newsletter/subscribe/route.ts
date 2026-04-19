// La estructura de la tabla está definida en /db/database.sql
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type SubscribeBody = {
  email?: unknown
  source?: unknown
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getRlsSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(req: Request) {
  try {
    const supabase = getRlsSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as SubscribeBody | null
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const source = typeof body?.source === "string" ? body.source.trim().slice(0, 80) : ""

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 })
    }

    const { error } = await supabase.from("newsletter_subscribers").insert([{ email, source }])

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, message: "¡Ya estás suscrito!" })
      }
      return NextResponse.json({ ok: false, error: "No se pudo suscribir" }, { status: 500 })
    }

    try {
      const origin = new URL(req.url).origin
      await fetch(`${origin}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NEWSLETTER",
          record: { email, source, created_at: new Date().toISOString() },
        }),
      })
    } catch {
      // no bloquea la suscripción
    }

    return NextResponse.json({ ok: true, message: "¡Gracias por suscribirte!" })
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

