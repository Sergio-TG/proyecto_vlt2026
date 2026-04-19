"use client"

import * as React from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

export default function MapAlojamientoSingle({
  lat,
  lng,
  nombre,
  localidad,
  precioBase,
}: {
  lat: number
  lng: number
  nombre: string
  localidad: string
  precioBase: number | null
}) {
  React.useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  return (
    <div className="h-[280px] rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm bg-white">
      <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup className="map-popup">
            <div className="w-[220px]">
              <p className="text-sm font-black text-slate-900 leading-tight">{nombre}</p>
              <p className="text-xs text-slate-500 mt-1">{localidad}</p>
              <p className="text-sm font-bold text-primary mt-2">
                {precioBase ? `$${precioBase.toLocaleString("es-AR")} / noche` : "Consultar precio"}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

