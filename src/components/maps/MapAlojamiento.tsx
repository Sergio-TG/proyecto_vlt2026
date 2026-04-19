"use client"

import * as React from "react"
import Link from "next/link"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { buildGaleriaUrls } from "@/lib/imagekit.config"

type MarkerItem = {
  id: string
  nombre: string
  localidad: string
  rating_google: number | null
  precio_base: number | null
  latitud: number
  longitud: number
  slug: string
  portadaUrl: string | null
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

function isValidLatLng(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

function extractLatLngFromGoogleMapsUrl(raw: unknown): { lat: number; lng: number } | null {
  const url = typeof raw === "string" ? raw.trim() : ""
  if (!url) return null

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(atMatch[1])
    const lng = Number(atMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  if (qMatch) {
    const lat = Number(qMatch[1])
    const lng = Number(qMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  const embedMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (embedMatch) {
    const lat = Number(embedMatch[1])
    const lng = Number(embedMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  return null
}

function getBookingScore(ratingGoogle: number | null) {
  if (!ratingGoogle || !Number.isFinite(ratingGoogle)) return null
  const score = ratingGoogle * 2
  const label =
    score >= 9.5 ? "Excepcional" : score >= 9 ? "Fantástico" : score >= 8.5 ? "Muy bueno" : score >= 8 ? "Bueno" : "Bien"
  return { score, label }
}

function HoverMarker({ marker }: { marker: MarkerItem }) {
  const markerRef = React.useRef<L.Marker>(null)

  const eventHandlers = React.useMemo(
    () => ({
      mouseover: () => markerRef.current?.openPopup(),
      mouseout: () => markerRef.current?.closePopup(),
    }),
    []
  )

  const icon = React.useMemo(() => {
    return L.divIcon({
      className: "brand-marker",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -38],
      html: `
        <div style="width:30px;height:42px;display:flex;align-items:center;justify-content:center">
          <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 1C8.4 1 3 6.4 3 13c0 9.3 12 28 12 28s12-18.7 12-28C27 6.4 21.6 1 15 1z" fill="#2563eb"/>
            <circle cx="15" cy="13" r="5" fill="white" opacity="0.95"/>
          </svg>
        </div>
      `,
    })
  }, [])

  const booking = getBookingScore(marker.rating_google)

  return (
    <Marker ref={markerRef} position={[marker.latitud, marker.longitud]} eventHandlers={eventHandlers} icon={icon}>
      <Popup className="map-popup">
        <div className="block w-[240px]">
          {marker.portadaUrl ? (
            <img src={marker.portadaUrl} alt={marker.nombre} className="w-full h-32 object-cover rounded-xl mb-3" />
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <Link href={`/alojamientos/${marker.slug}`} className="min-w-0">
              <p className="text-sm font-black text-slate-900 leading-tight truncate">{marker.nombre}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{marker.localidad}</p>
            </Link>

            {booking ? (
              <div className="flex-shrink-0 bg-primary text-white rounded-lg px-2 py-1 text-[10px] font-black">
                {booking.score.toFixed(1)} {booking.label}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">Precio</div>
              <div className="text-base font-black text-primary leading-none">
                {marker.precio_base ? `$ ${marker.precio_base.toLocaleString("es-AR")}` : "Consultar"}
              </div>
            </div>

            <Link
              href={`/alojamientos/${marker.slug}`}
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-colors"
            >
              + Info
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapAlojamiento({
  accommodations,
  portadaBySlug,
}: {
  accommodations: AlojamientoAprobado[]
  portadaBySlug: Record<string, string | null>
}) {
  React.useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  const markers = React.useMemo<MarkerItem[]>(() => {
    return accommodations.reduce<MarkerItem[]>((acc, a) => {
      // Prioridad 1: columnas numéricas en DB (latitud/longitud).
      let lat = toNum((a as { latitud?: unknown }).latitud)
      let lng = toNum((a as { longitud?: unknown }).longitud)

      // Fallback: parsear URL de Maps solo si DB viene vacía.
      if (lat == null || lng == null) {
        const fallback = extractLatLngFromGoogleMapsUrl(
          (a as { google_maps?: unknown; ubicacion_google_maps?: unknown }).google_maps ??
            (a as { ubicacion_google_maps?: unknown }).ubicacion_google_maps
        )
        if (fallback) {
          lat = fallback.lat
          lng = fallback.lng
        }
      }

      // Defensive coding: si no hay coordenadas útiles, omitir sin romper.
      if (!isValidLatLng(lat, lng)) {
        console.warn(
          `Aviso: El alojamiento ${String(a.nombre || "").trim()} no tiene coordenadas en DB ni en URL, omitiendo en mapa`
        )
        return acc
      }

      const safeLat = lat as number
      const safeLng = lng as number

      const slug = a.slug || slugify(a.nombre)
      const portadaFile = portadaBySlug[slug]
      const portadaUrl = portadaFile ? buildGaleriaUrls(slug, [String(portadaFile)], "card")[0] ?? null : null

      acc.push({
        id: a.id,
        nombre: a.nombre,
        localidad: a.localidad,
        rating_google: a.rating_google ?? null,
        precio_base: a.precio_base ?? null,
        latitud: safeLat,
        longitud: safeLng,
        slug,
        portadaUrl,
      })
      return acc
    }, [])
  }, [accommodations, portadaBySlug])

  if (markers.length === 0) {
    if (process.env.NODE_ENV !== "production" && accommodations.length > 0) {
      const sample = accommodations.slice(0, 3).map((a) => ({
        id: a.id,
        slug: a.slug,
        latitud: (a as { latitud?: unknown }).latitud,
        longitud: (a as { longitud?: unknown }).longitud,
        google_maps: (a as { google_maps?: unknown }).google_maps,
      }))
      console.warn("Mapa sin marcadores: revisar latitud/longitud o google_maps en alojamientos_aprobados.", sample)
    }
    return (
      <div className="h-[400px] rounded-[2rem] border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        No hay coordenadas disponibles para mostrar en el mapa.
      </div>
    )
  }

  const center: [number, number] = [markers[0].latitud, markers[0].longitud]

  return (
    <div className="h-[400px] rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <HoverMarker key={m.id} marker={m} />
        ))}
      </MapContainer>
    </div>
  )
}
