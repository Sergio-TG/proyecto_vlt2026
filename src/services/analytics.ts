export const ANALYTICS_EVENT_TYPES = {
  CLIC_ALOJAMIENTO: "clic_alojamiento",
  CLIC_CONTACTO: "clic_contacto",
  CLIC_RESERVA_TERMAS: "clic_reserva_termas",
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
