"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { BlogGalleryItem } from "@/lib/blog"
import { cn } from "@/lib/utils"

type BlogMediaGalleryProps = {
  items: BlogGalleryItem[]
  alt?: string
  className?: string
}

function MediaTile({
  item,
  alt,
  onOpen,
}: {
  item: BlogGalleryItem
  alt: string
  onOpen?: () => void
}) {
  if (item.type === "video") {
    return (
      <video
        src={item.url}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    )
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ampliar imagen: ${item.caption || alt}`}
      className="group relative block h-full w-full cursor-zoom-in overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.caption || alt}
        draggable={false}
        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25"
      >
        <span className="rounded-full bg-white/90 p-2.5 text-slate-800 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-5 w-5" />
        </span>
      </span>
    </button>
  )
}

type LightboxImage = { url: string; alt: string; caption?: string }

function BlogImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onIndexChange: (i: number) => void
}) {
  const total = images.length
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const prev = React.useCallback(
    () => onIndexChange((index - 1 + total) % total),
    [index, total, onIndexChange],
  )
  const next = React.useCallback(
    () => onIndexChange((index + 1) % total),
    [index, total, onIndexChange],
  )

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft" && total > 1) prev()
      else if (e.key === "ArrowRight" && total > 1) next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, prev, next, total])

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Swipe táctil en el modal
  const touchStartX = React.useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || total < 2) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return
    if (dx > 0) prev()
    else next()
  }

  const current = images[index]
  if (!current) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-6 w-6" />
      </button>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-6"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-6"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      ) : null}

      <figure className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.url}
          src={current.url}
          alt={current.alt}
          className="max-h-[90vh] max-w-[90vw] select-none object-contain"
        />
        {current.caption || total > 1 ? (
          <figcaption className="px-4 text-center text-sm text-white/80">
            {current.caption}
            {total > 1 ? (
              <span className="ml-2 text-white/50">
                {index + 1} / {total}
              </span>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    </div>,
    document.body,
  )
}

/** Galería multimedia del post público: grid si hay pocos elementos, carrusel si hay varios. */
export function BlogMediaGallery({ items, alt = "", className }: BlogMediaGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selected, setSelected] = React.useState(0)
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)

  // Solo las imágenes son ampliables; mapeamos índice de item -> índice de imagen.
  const { images, imageIndexByItem } = React.useMemo(() => {
    const imgs: LightboxImage[] = []
    const map = new Map<number, number>()
    ;(items ?? []).forEach((item, i) => {
      if (item.type === "video") return
      map.set(i, imgs.length)
      imgs.push({
        url: item.url,
        alt: item.caption || (items.length > 1 ? `${alt} ${i + 1}` : alt),
        caption: item.caption,
      })
    })
    return { images: imgs, imageIndexByItem: map }
  }, [items, alt])

  const openAt = React.useCallback(
    (itemIndex: number) => {
      const idx = imageIndexByItem.get(itemIndex)
      if (idx !== undefined) setLightboxIndex(idx)
    },
    [imageIndexByItem],
  )
  const closeLightbox = React.useCallback(() => setLightboxIndex(null), [])

  const lightbox =
    lightboxIndex !== null ? (
      <BlogImageLightbox
        images={images}
        index={lightboxIndex}
        onClose={closeLightbox}
        onIndexChange={setLightboxIndex}
      />
    ) : null

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  if (!items || items.length === 0) return null

  if (items.length === 1) {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-slate-100 shadow-sm", className)}>
        <div className="aspect-video w-full">
          <MediaTile item={items[0]} alt={alt} onOpen={() => openAt(0)} />
        </div>
        {items[0].caption ? (
          <p className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">{items[0].caption}</p>
        ) : null}
        {lightbox}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Carousel className="w-full" opts={{ align: "start", loop: true }} setApi={setApi}>
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem key={`${item.url}-${i}`}>
              <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <div className="aspect-video w-full">
                  <MediaTile item={item} alt={`${alt} ${i + 1}`} onOpen={() => openAt(i)} />
                </div>
                {item.caption ? (
                  <p className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">{item.caption}</p>
                ) : null}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      <div className="flex items-center justify-center gap-1.5">
        {items.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              i === selected ? "bg-primary" : "bg-slate-200",
            )}
            aria-hidden
          />
        ))}
      </div>
      {lightbox}
    </div>
  )
}
