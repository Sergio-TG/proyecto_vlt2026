/** Parseo de URLs de Google Maps y coordenadas para mapas sin API key (Leaflet / enlaces). */

export function isValidLatLng(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

/**
 * Extrae lat/lng de URLs de Google Maps.
 * Prioridad: parejas !3d!4d (POI; se usa la última) > @ (cámara) > q=coordenadas
 */
export function extractLatLngFromGoogleMapsUrl(raw: unknown): { lat: number; lng: number } | null {
  const url = typeof raw === "string" ? raw.trim() : ""
  if (!url) return null

  const pairs: { lat: number; lng: number }[] = []
  const re = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(url)) !== null) {
    const lat = Number(m[1])
    const lng = Number(m[2])
    if (isValidLatLng(lat, lng)) pairs.push({ lat, lng })
  }
  if (pairs.length > 0) return pairs[pairs.length - 1]

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(atMatch[1])
    const lng = Number(atMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (qMatch) {
    const lat = Number(qMatch[1])
    const lng = Number(qMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  return null
}

/**
 * listing: URL parseable gana; si no, usa BD.
 * detail: si hay URL de socio y no se pueden sacar coords, no usar BD (evita pin distinto a "Ver en Google Maps").
 */
export function getAccommodationMapPin(
  dbLat: number | null,
  dbLng: number | null,
  mapsUrl: string | null | undefined,
  mode: "listing" | "detail"
): { lat: number; lng: number } | null {
  const url = String(mapsUrl ?? "").trim()
  const fromUrl = url ? extractLatLngFromGoogleMapsUrl(url) : null
  if (fromUrl) return fromUrl
  if (mode === "detail" && url) return null
  if (isValidLatLng(dbLat, dbLng)) return { lat: dbLat!, lng: dbLng! }
  return null
}

export function buildGoogleMapsHref(opts: {
  lat: number | null
  lng: number | null
  rawUrl: string | null | undefined
}): string {
  const url = String(opts.rawUrl || "").trim()
  if (url) return url
  if (isValidLatLng(opts.lat, opts.lng)) {
    return `https://www.google.com/maps?q=${opts.lat},${opts.lng}`
  }
  return ""
}

const SHORT_HOSTS = new Set(["maps.app.goo.gl"])

export function needsGoogleMapsRedirectResolve(raw: string): boolean {
  const u = String(raw || "").trim()
  if (!u) return false
  try {
    const parsed = new URL(u)
    const h = parsed.hostname.replace(/^www\./i, "").toLowerCase()
    if (SHORT_HOSTS.has(h)) return true
    if (h === "goo.gl" && parsed.pathname.includes("maps")) return true
  } catch {
    return false
  }
  return false
}

function isProbablyGoogleMapsUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    const h = u.hostname.toLowerCase()
    const path = u.pathname.toLowerCase()
    if (h === "maps.google.com") return true
    if (path.includes("/maps")) return true
    if (h.endsWith("google.com") && (path.includes("maps") || u.search.toLowerCase().includes("map_action"))) return true
    return false
  } catch {
    return false
  }
}

export function assertAllowedMapsResolveInput(raw: string) {
  const u = String(raw || "").trim()
  if (!u) throw new Error("missing")
  let parsed: URL
  try {
    parsed = new URL(u)
  } catch {
    throw new Error("invalid")
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("invalid protocol")
  const h = parsed.hostname.replace(/^www\./i, "").toLowerCase()
  const okHost = SHORT_HOSTS.has(h) || (h === "goo.gl" && parsed.pathname.includes("maps"))
  if (!okHost) throw new Error("host not allowed")
}

export function assertResolvedGoogleMapsOutput(finalUrlStr: string) {
  const u = String(finalUrlStr || "").trim()
  if (!u) throw new Error("empty resolved")
  if (!isProbablyGoogleMapsUrl(u)) throw new Error("resolved not google maps")
}
