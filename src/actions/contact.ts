"use server"

import { Resend } from "resend"
import { getServerSupabase } from "@/lib/supabase-server"

type ContactActionResult = { success: boolean; message: string }

function asTrimmedString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return ""
  return value.trim()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function clamp(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function submitContact(formData: FormData): Promise<ContactActionResult> {
  console.log("Datos recibidos:", Object.fromEntries(formData.entries()))
  
  const supabase = getServerSupabase()
  if (!supabase) {
    return { success: false, message: "Configuración del servidor incompleta." }
  }

  // 1. Procesamiento y validación
  const name = clamp(asTrimmedString(formData.get("name")), 80)
  const lastname = clamp(asTrimmedString(formData.get("lastname")), 80)
  const email = clamp(asTrimmedString(formData.get("email")).toLowerCase(), 120)
  const phone = clamp(asTrimmedString(formData.get("phone")), 40)
  const message = clamp(asTrimmedString(formData.get("message")), 4000)

  if (!name || !lastname || !email || !message) {
    return { success: false, message: "Completá los campos obligatorios." }
  }

  if (!isValidEmail(email)) {
    return { success: false, message: "Email inválido." }
  }

  // 2. Inserción en Supabase (Mapeo corregido con tu tabla)
  const { error: insertError } = await supabase.from("contact_submissions").insert([
    {
      first_name: name,      // Mapeo a columna 'first_name'
      last_name: lastname,   // Mapeo a columna 'last_name'
      email: email,
      phone: phone || null,
      message: message,
    },
  ])

  if (insertError) {
    console.error("❌ ERROR EN SUPABASE:", insertError)
    return { success: false, message: "Error al guardar en base de datos: " + insertError.message }
  }

  // 3. Envío de Email
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = (process.env.CONTACT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "").trim()
  const toEmail = (process.env.CONTACT_TO_EMAIL || "").trim() || fromEmail

  if (!resendApiKey || !fromEmail || !toEmail) {
    return { success: true, message: "Mensaje recibido. Te responderemos a la brevedad." }
  }

  try {
    const resend = new Resend(resendApiKey)
    const fullName = `${name} ${lastname}`.trim()
    const safePhone = phone || "—"

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto - ${fullName}`,
      text: `Nuevo mensaje de contacto\n\nNombre: ${fullName}\nEmail: ${email}\nTeléfono: ${safePhone}\n\nMensaje:\n${message}\n`,
      html: `<h2>Nuevo mensaje de contacto</h2>
             <p><strong>Nombre:</strong> ${escapeHtml(fullName)}</p>
             <p><strong>Email:</strong> ${escapeHtml(email)}</p>
             <p><strong>Teléfono:</strong> ${escapeHtml(safePhone)}</p>
             <p><strong>Mensaje:</strong></p>
             <pre style="white-space:pre-wrap;font-family:monospace;">${escapeHtml(message)}</pre>`,
    })
    
    return { success: true, message: "Mensaje enviado. Te responderemos a la brevedad." }
  } catch (error: unknown) {
    console.error("❌ ERROR EN RESEND:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error ? String((error as { message?: unknown }).message || "") : ""
    return { success: false, message: "Error al enviar el email: " + (message || "Error desconocido") }
  }
}
