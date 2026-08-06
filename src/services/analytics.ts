export const ANALYTICS_EVENT_TYPES = {
  CLIC_ALOJAMIENTO: "clic_alojamiento",
  CLIC_CONTACTO: "clic_contacto",
  CLIC_RESERVA_TERMAS: "clic_reserva_termas",
  PAGE_VIEW: "page_view",
  SERVICE_INTEREST: "service_interest",
  CONSULT_AGENCY: "consult_agency",
  DIRECT_PROVIDER: "direct_provider",
} as const

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[keyof typeof ANALYTICS_EVENT_TYPES]

/**
 * Registra un evento de interacción en Supabase (`analytics_events`).
 * Falla en silencio para no interrumpir la UX del usuario.
 */
export function trackEvent(eventType: AnalyticsEventType, targetId?: string | null): void {
  if (typeof window === "undefined") return

  const payload = JSON.stringify({
    event_type: eventType,
    target_id: targetId?.trim() || null,
  })

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      const sent = navigator.sendBeacon("/api/analytics/track", blob)
      if (sent) return
    }
  } catch {
    // fallback a fetch
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // noop
  })
}

/** Vista de ficha de alojamiento (slug en target_id). */
export function trackPageView(slug: string): void {
  const value = slug.trim()
  if (!value) return
  trackEvent(ANALYTICS_EVENT_TYPES.PAGE_VIEW, value)
}

/** Consulta de interés por un servicio/experiencia. */
export function trackServiceInterest(service: string): void {
  const value = service.trim()
  if (!value) return
  trackEvent(ANALYTICS_EVENT_TYPES.SERVICE_INTEREST, value)
}

/** CTA primario: consultar con un asesor de Viví Las Termas. */
export function trackConsultAgency(providerId: string): void {
  const value = providerId.trim()
  if (!value) return
  trackEvent(ANALYTICS_EVENT_TYPES.CONSULT_AGENCY, value)
}

/** CTA secundario: contacto directo con el prestador. */
export function trackDirectProvider(providerId: string): void {
  const value = providerId.trim()
  if (!value) return
  trackEvent(ANALYTICS_EVENT_TYPES.DIRECT_PROVIDER, value)
}
