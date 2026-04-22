"use client"

import * as React from "react"

export default function MapAlojamientoSingle(props: {
  lat: number
  lng: number
  nombre: string
  localidad: string
  precioBase: number | null
}) {
  const src = React.useMemo(() => {
    return `https://www.google.com/maps?q=${props.lat},${props.lng}&output=embed`
  }, [props.lat, props.lng])

  return (
    <div className="h-[280px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
      <iframe
        title={`Mapa - ${props.nombre}`}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  )
}
