"use server"

import { Resend } from "resend"
import {
  OSCURA_OVERA_WHATSAPP_PHONE,
  waMeHref,
} from "@/lib/oscura-overa-champaqui"

export type AdviceActionResult = {
  success: boolean
  message: string
  whatsappHref?: string
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

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "")
}

export async function submitOscuraOveraAdvice(formData: FormData): Promise<AdviceActionResult> {
  const excursion = clamp(String(formData.get("excursion") || "").trim(), 160)
  const people = clamp(String(formData.get("people") || "").trim(), 8)
  const ages = clamp(String(formData.get("ages") || "").trim(), 160)
  const experience = clamp(String(formData.get("experience") || "").trim(), 80)
  const outing = clamp(String(formData.get("outing") || "").trim(), 80)
  const phone = clamp(String(formData.get("phone") || "").trim(), 40)
  const locale = String(formData.get("locale") || "es").trim() === "en" ? "en" : "es"
  const whatsappPrefill = clamp(String(formData.get("whatsappPrefill") || "").trim(), 2000)

  const peopleCount = Number.parseInt(people, 10)
  const phoneDigits = digitsOnly(phone)

  if (!excursion || !ages || !experience || !outing || !phone || !Number.isFinite(peopleCount) || peopleCount < 1) {
    return {
      success: false,
      message:
        locale === "en"
          ? "Please complete the required fields."
          : "Completá los campos obligatorios.",
    }
  }

  if (phoneDigits.length < 8) {
    return {
      success: false,
      message:
        locale === "en"
          ? "Please enter a valid WhatsApp number."
          : "Ingresá un WhatsApp válido.",
    }
  }

  const whatsappHref = waMeHref(
    OSCURA_OVERA_WHATSAPP_PHONE,
    whatsappPrefill ||
      `Consulta Oscura Overa — ${excursion}. Personas: ${people}. WhatsApp: ${phone}`,
  )

  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = (process.env.CONTACT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "").trim()
  const toEmail = (process.env.CONTACT_TO_EMAIL || "").trim() || fromEmail

  if (!resendApiKey || !fromEmail || !toEmail) {
    return {
      success: true,
      message:
        locale === "en"
          ? "We received your enquiry. Continue on WhatsApp to reach Viví Las Termas."
          : "Recibimos tu consulta. Continuá por WhatsApp para escribirle a Viví Las Termas.",
      whatsappHref,
    }
  }

  try {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Asesoramiento Oscura Overa — ${excursion}`,
      text: `Nueva consulta de excursión Oscura Overa (Adrián Martínez)

Excursión: ${excursion}
Personas: ${people}
Edades: ${ages}
Experiencia: ${experience}
Tipo de salida: ${outing}
WhatsApp: ${phone}

Derivar al guía de Oscura Overa.
`,
      html: `<h2>Nueva consulta Oscura Overa</h2>
        <p>Derivar al guía Adrián Martínez (Oscura Overa).</p>
        <p><strong>Excursión:</strong> ${escapeHtml(excursion)}</p>
        <p><strong>Personas:</strong> ${escapeHtml(people)}</p>
        <p><strong>Edades:</strong> ${escapeHtml(ages)}</p>
        <p><strong>Experiencia:</strong> ${escapeHtml(experience)}</p>
        <p><strong>Tipo de salida:</strong> ${escapeHtml(outing)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(phone)}</p>`,
    })

    return {
      success: true,
      message:
        locale === "en"
          ? "We received your enquiry. We’ll pass it to the Oscura Overa guide."
          : "Recibimos tu consulta. La derivamos al guía de Oscura Overa.",
      whatsappHref,
    }
  } catch (error: unknown) {
    console.error("Oscura Overa advice email error:", error)
    return {
      success: false,
      message:
        locale === "en"
          ? "We couldn’t send the enquiry. Please try WhatsApp."
          : "No pudimos enviar la consulta. Probá por WhatsApp.",
      whatsappHref,
    }
  }
}
