
"use client"

import * as React from "react"
import { X } from "lucide-react"
import CustomImage from "@/components/common/CustomImage"
import { IMAGE_FOLDERS, type ImageFolder, IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

interface AccommodationGalleryProps {
  images?: string[]
  folder?: ImageFolder
  subfolder?: string
  paths?: string[]
  title: string
}

export function AccommodationGallery({ images, folder, subfolder, paths, title }: AccommodationGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [initialSlide, setInitialSlide] = React.useState(0)
  const [orientationByIndex, setOrientationByIndex] = React.useState<Record<number, "portrait" | "landscape">>({})

  const openLightbox = (index: number) => {
    setInitialSlide(index)
    setIsOpen(true)
  }

  // Handle escape key to close lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      // Prevent scrolling when lightbox is open
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const toImageKitUrl = React.useCallback((relativePath: string) => {
    const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "")
    const rel = relativePath.trim().replace(/^\/+/, "")
    return `${base}/${rel}`
  }, [])

  const renderTile = React.useCallback(
    (index: number, className: string, showOverlay?: { label: string }) => {
      const isUrl = Boolean(images && images.length > 0)
      if (!isUrl && (!folder || !paths || paths.length === 0)) return null
      const clickable = () => openLightbox(index)

      return (
        <button
          type="button"
          className={`relative overflow-hidden rounded-2xl bg-slate-100 group ${className}`}
          onClick={clickable}
        >
          {isUrl ? (
            <img
              src={(images as string[])[index]}
              alt={`${title} - Foto ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <CustomImage
              path={(paths as string[])[index]}
              folder={folder as ImageFolder}
              subfolder={subfolder}
              alt={`${title} - Foto ${index + 1}`}
              fill
              className="absolute inset-0"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {showOverlay && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <span className="text-white font-black text-sm md:text-base tracking-tight">
                {showOverlay.label}
              </span>
            </div>
          )}
        </button>
      )
    },
    [folder, images, paths, subfolder, title]
  )

  const sources = React.useMemo(() => {
    if (images && images.length > 0) return images
    if (folder && paths && paths.length > 0) {
      const relPrefix = subfolder ? `${IMAGE_FOLDERS[folder]}/${subfolder}` : `${IMAGE_FOLDERS[folder]}`
      return paths.map((p) => toImageKitUrl(`${relPrefix}/${p}`))
    }
    return []
  }, [folder, images, paths, subfolder, toImageKitUrl])

  React.useEffect(() => {
    let cancelled = false
    async function loadOrientations() {
      const next: Record<number, "portrait" | "landscape"> = {}
      await Promise.all(
        sources.map(
          (src, idx) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.onload = () => {
                const portrait = img.naturalHeight > img.naturalWidth
                next[idx] = portrait ? "portrait" : "landscape"
                resolve()
              }
              img.onerror = () => resolve()
              img.src = src
            })
        )
      )
      if (cancelled) return
      setOrientationByIndex(next)
    }
    if (sources.length > 0) loadOrientations()
    return () => {
      cancelled = true
    }
  }, [sources])

  const isPortrait = (index: number) => orientationByIndex[index] === "portrait"

  const effectiveCount = sources.length
  if (effectiveCount === 0) return null

  const heroIndices = [0, 1, 2].filter((i) => i < effectiveCount)
  const remaining = Math.max(0, effectiveCount - heroIndices.length)
  const thumbsStart = heroIndices.length
  const thumbs = Array.from({ length: Math.min(5, remaining) }, (_, i) => thumbsStart + i).filter(
    (i) => i < effectiveCount
  )
  const hidden = Math.max(0, effectiveCount - (thumbsStart + thumbs.length))

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fotos</h3>
          <button
            type="button"
            className="text-sm font-black text-primary hover:underline"
            onClick={() => openLightbox(0)}
          >
            Ver todas ({effectiveCount})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:h-[460px]">
          {heroIndices[0] !== undefined && renderTile(heroIndices[0], "lg:col-span-3 lg:row-span-2 h-[260px] lg:h-full")}
          {heroIndices[1] !== undefined &&
            renderTile(heroIndices[1], "lg:col-span-1 lg:row-span-1 h-[220px] lg:h-full")}
          {heroIndices[2] !== undefined &&
            renderTile(heroIndices[2], "lg:col-span-1 lg:row-span-1 h-[220px] lg:h-full")}
        </div>

        {thumbs.length > 0 && (
          <div
            className={`grid gap-3 ${
              thumbs.length === 1
                ? "grid-cols-1"
                : thumbs.length === 2
                  ? "grid-cols-2"
                  : thumbs.length === 3
                    ? "grid-cols-3"
                    : thumbs.length === 4
                      ? "grid-cols-4"
                      : "grid-cols-5"
            }`}
          >
            {thumbs.map((idx, i) => {
              const overlay =
                hidden > 0 && i === thumbs.length - 1 ? { label: `+${hidden} fotos más` } : undefined
              return (
                <div key={idx} className={isPortrait(idx) ? "aspect-[3/4]" : "aspect-[4/3]"}>
                  {renderTile(idx, "w-full h-full rounded-xl", overlay)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-12">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full h-12 w-12"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Cerrar</span>
          </Button>

          <Carousel
            opts={{
              align: "start",
              loop: true,
              startIndex: initialSlide,
            }}
            className="w-full max-w-5xl max-h-[90vh]"
          >
            <CarouselContent>
              {sources.map((img, index) => (
                <CarouselItem key={index} className="flex items-center justify-center h-[80vh]">
                  <img
                    src={img}
                    alt={`${title} - Foto ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-12 bg-white/10 hover:bg-white/20 text-white border-none h-12 w-12" />
            <CarouselNext className="right-2 md:-right-12 bg-white/10 hover:bg-white/20 text-white border-none h-12 w-12" />
          </Carousel>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
            Presiona ESC para cerrar
          </div>
        </div>
      )}
    </>
  )
}
