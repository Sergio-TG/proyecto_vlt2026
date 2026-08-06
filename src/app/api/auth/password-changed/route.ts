import { NextResponse } from "next/server"
import { Resend } from "resend"
import { getServerSupabase } from "@/lib/supabase-server"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function POST(req: Request) {
  try {
    const supabaseService = getServerSupabase()
    if (!supabaseService) {
      return NextResponse.json({ ok: false, error: "Servidor no configurado." }, { status: 500 })
    }

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : ""
    if (!token) {
      return NextResponse.json({ ok: false, error: "Sesión requerida." }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseService.auth.getUser(token)
    const email = userData?.user?.email?.trim()
    if (userErr || !email) {
      return NextResponse.json({ ok: false, error: "Sesión inválida." }, { status: 401 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = (
      process.env.AUTH_FROM_EMAIL ||
      process.env.CONTACT_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      ""
    ).trim()

    if (!resendApiKey || !fromEmail) {
      console.warn("password-changed: Resend no configurado; se omite el email de seguridad.")
      return NextResponse.json({ ok: true, skipped: true })
    }

    const resend = new Resend(resendApiKey)
    const safeEmail = escapeHtml(email)

    await resend.emails.send({
      from: fromEmail.includes("<") ? fromEmail : `Viví las Termas <${fromEmail}>`,
      to: email,
      subject: "Tu contraseña fue actualizada — Viví las Termas",
      text: `Hola,\n\nTu contraseña se ha actualizado correctamente.\n\nSi no fuiste vos, ponete en contacto con soporte inmediatamente.\n\n— Equipo Viví las Termas`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
          <h2 style="margin:0 0 12px">Contraseña actualizada</h2>
          <p>Hola,</p>
          <p>Tu contraseña de la cuenta <strong>${safeEmail}</strong> se ha actualizado correctamente.</p>
          <p><strong>Si no fuiste vos, ponete en contacto con soporte inmediatamente.</strong></p>
          <p style="color:#64748b;font-size:13px;margin-top:24px">— Equipo Viví las Termas</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error("password-changed email error:", e)
    // No fallar el flujo de cambio de clave por un error de notificación.
    return NextResponse.json({ ok: true, skipped: true })
  }
}
