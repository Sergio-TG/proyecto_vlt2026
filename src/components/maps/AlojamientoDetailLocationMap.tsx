"use client"

import * as React from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { ExternalLink } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

type Props = {
  position: [number, number]
  /** Mismo enlace que el botón “Ver en Google Maps”. */
  googleMapsHref: string
  titulo: string
  className?: string
}

export function AlojamientoDetailLocationMap({ position, googleMapsHref, titulo, className }: Props) {
  const { locale } = useLanguage()
  const dm = getSiteCopy(locale).pages.detailLocationMap
  React.useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  const key = `${position[0].toFixed(5)},${position[1].toFixed(5)}`

  return (
    <div className={className ?? "h-full min-h-[360px] w-full"}>
      <MapContainer
        key={key}
        center={position}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full z-0 rounded-lg"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="min-w-[200px] space-y-2">
              <p className="text-sm font-bold text-slate-900">{titulo}</p>
              <p className="text-xs text-slate-600">{dm.popupNote}</p>
              {googleMapsHref ? (
                <a
                  href={googleMapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  {dm.openGoogle}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
