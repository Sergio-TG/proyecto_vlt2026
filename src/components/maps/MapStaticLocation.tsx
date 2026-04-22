"use client"

import * as React from "react"

export function MapStaticLocation({
  lat,
  lng,
  title,
  address,
}: {
  lat: number
  lng: number
  title: string
  address: string
}) {
  const src = React.useMemo(() => {
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`
  }, [lat, lng])

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
      <iframe
        title={`Mapa - ${title}`}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  )
}
