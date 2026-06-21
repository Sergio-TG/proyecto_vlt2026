"use client"

import { AlojamientoDetailLocationMap } from "@/components/maps/AlojamientoDetailLocationMap"

export type MapaTermasProps = {
  position: [number, number]
  googleMapsHref: string
  titulo: string
  className?: string
}

/** Mapa Leaflet de Termas del Sol — solo cliente (evita `window` en SSR/build). */
export function MapaTermas({ position, googleMapsHref, titulo, className }: MapaTermasProps) {
  return (
    <AlojamientoDetailLocationMap
      position={position}
      googleMapsHref={googleMapsHref}
      titulo={titulo}
      className={className}
    />
  )
}
