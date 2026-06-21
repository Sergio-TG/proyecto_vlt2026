"use client"

import * as React from "react"
import { GaleriaGrid } from "@/components/alojamientos/GaleriaGrid"
import { GaleriaLightbox } from "@/components/alojamientos/GaleriaLightbox"
import { IK_TRANSFORMS } from "@/lib/imagekit.config"
import type { AccommodationGalleryVideo } from "@/lib/accommodation-gallery.config"

export interface GaleriaAlojamientoProps {
  thumbUrls: string[]
  fullUrls: string[]
  nombreAlojamiento: string
  galleryVideo?: AccommodationGalleryVideo | null
}

export function GaleriaAlojamiento({
  thumbUrls,
  fullUrls,
  nombreAlojamiento,
  galleryVideo,
}: GaleriaAlojamientoProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [initialIndex, setInitialIndex] = React.useState(0)
  const [failedIndexes, setFailedIndexes] = React.useState<Set<number>>(() => new Set())

  const safeThumbUrls = React.useMemo(() => thumbUrls ?? [], [thumbUrls])
  const safeFullUrls = React.useMemo(() => fullUrls ?? [], [fullUrls])
  const leadVideo = galleryVideo ?? null

  const mainUrl = React.useMemo(() => {
    const u = safeThumbUrls[0]
    if (!u) return undefined
    const base = u.split("?")[0] ?? u
    return `${base}?${IK_TRANSFORMS.galFull}`
  }, [safeThumbUrls])

  const handleOpenAt = (index: number) => {
    setInitialIndex(leadVideo ? index + 1 : index)
    setIsOpen(true)
  }

  const handleOpenVideo = () => {
    setInitialIndex(0)
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
    const photos = safeThumbUrls.filter((_, i) => !failedIndexes.has(i)).length
    return photos + (leadVideo ? 1 : 0)
  }, [failedIndexes, leadVideo, safeThumbUrls])

  const hasPhotos = safeThumbUrls.length > 0 && safeFullUrls.length > 0
  if (!hasPhotos && !leadVideo) return null

  return (
    <>
      <GaleriaGrid
        thumbUrls={safeThumbUrls}
        mainUrl={mainUrl}
        nombreAlojamiento={nombreAlojamiento}
        leadVideo={leadVideo}
        onFotoClick={handleOpenAt}
        onVideoClick={handleOpenVideo}
        onVerTodas={handleVerTodas}
        onImageError={handleImageError}
        failedIndexes={failedIndexes}
      />

      {isOpen && validCount > 0 && (
        <GaleriaLightbox
          fullUrls={safeFullUrls}
          thumbUrls={safeThumbUrls}
          nombreAlojamiento={nombreAlojamiento}
          leadVideo={leadVideo}
          initialIndex={initialIndex}
          onClose={() => setIsOpen(false)}
          onImageError={handleImageError}
          failedIndexes={failedIndexes}
        />
      )}
    </>
  )
}
