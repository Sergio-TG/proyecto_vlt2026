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

function HoverMarker({ marker }: { marker: MarkerItem }) {
  const markerRef = React.useRef<L.Marker>(null)

  const eventHandlers = React.useMemo(
    () => ({
      mouseover: () => markerRef.current?.openPopup(),
      mouseout: () => markerRef.current?.closePopup(),
    }),
    []
  )

  return (
    <Marker ref={markerRef} position={[marker.latitud, marker.longitud]} eventHandlers={eventHandlers}>
      <Popup className="map-popup">
        <Link href={`/alojamientos/${marker.slug}`} className="block w-[220px] map-popup-card">
          {marker.portadaUrl ? (
            <img src={marker.portadaUrl} alt={marker.nombre} className="w-full h-28 object-cover rounded-xl mb-3" />
          ) : null}
          <p className="text-sm font-black text-slate-900 leading-tight">{marker.nombre}</p>
          <p className="text-xs text-slate-500 mt-1">{marker.localidad}</p>
          <p className="text-sm font-bold text-primary mt-2">
            {marker.precio_base ? `$${marker.precio_base.toLocaleString("es-AR")} / noche` : "Consultar precio"}
          </p>
        </Link>
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
        const lat = toNum((a as { latitud?: unknown }).latitud)
        const lng = toNum((a as { longitud?: unknown }).longitud)
        if (lat == null || lng == null) return acc

        const slug = a.slug || slugify(a.nombre)
        const portadaFile = portadaBySlug[slug]
        const portadaUrl = portadaFile ? buildGaleriaUrls(slug, [String(portadaFile)], "card")[0] ?? null : null

        acc.push({
          id: a.id,
          nombre: a.nombre,
          localidad: a.localidad,
          precio_base: a.precio_base ?? null,
          latitud: lat,
          longitud: lng,
          slug,
          portadaUrl,
        })
        return acc
      }, [])
  }, [accommodations, portadaBySlug])

  if (markers.length === 0) {
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
