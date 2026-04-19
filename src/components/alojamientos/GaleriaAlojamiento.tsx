"use client"

import * as React from "react"
import { GaleriaGrid } from "@/components/alojamientos/GaleriaGrid"
import { GaleriaLightbox } from "@/components/alojamientos/GaleriaLightbox"
import { IK_TRANSFORMS } from "@/lib/imagekit.config"

export interface GaleriaAlojamientoProps {
  thumbUrls: string[]
  fullUrls: string[]
  nombreAlojamiento: string
}

export function GaleriaAlojamiento({ thumbUrls, fullUrls, nombreAlojamiento }: GaleriaAlojamientoProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [initialIndex, setInitialIndex] = React.useState(0)
  const [failedIndexes, setFailedIndexes] = React.useState<Set<number>>(() => new Set())

  const safeThumbUrls = React.useMemo(() => thumbUrls ?? [], [thumbUrls])
  const safeFullUrls = React.useMemo(() => fullUrls ?? [], [fullUrls])

  const mainUrl = React.useMemo(() => {
    const u = safeThumbUrls[0]
    if (!u) return undefined
    const base = u.split("?")[0] ?? u
    return `${base}?${IK_TRANSFORMS.galFull}`
  }, [safeThumbUrls])

  const handleOpenAt = (index: number) => {
    setInitialIndex(index)
    setIsOpen(true)
  }

  const handleVerTodas = () => {
    setInitialIndex(0)
    setIsOpen(true)
  }

  const handleImageError = (index: number) => {
    setFailedIndexes((prev) => {
      if (prev.has(index)) return prev
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }

  const validCount = React.useMemo(() => {
    return safeThumbUrls.filter((_, i) => !failedIndexes.has(i)).length
  }, [failedIndexes, safeThumbUrls])

  if (safeThumbUrls.length === 0 || safeFullUrls.length === 0) return null

  return (
    <>
      <GaleriaGrid
        thumbUrls={safeThumbUrls}
        mainUrl={mainUrl}
        nombreAlojamiento={nombreAlojamiento}
        onFotoClick={handleOpenAt}
        onVerTodas={handleVerTodas}
        onImageError={handleImageError}
        failedIndexes={failedIndexes}
      />

      {isOpen && validCount > 0 && (
        <GaleriaLightbox
          fullUrls={safeFullUrls}
          thumbUrls={safeThumbUrls}
          nombreAlojamiento={nombreAlojamiento}
          initialIndex={initialIndex}
          onClose={() => setIsOpen(false)}
          onImageError={handleImageError}
          failedIndexes={failedIndexes}
        />
      )}
    </>
  )
}
