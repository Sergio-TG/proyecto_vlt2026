"use client"

import * as React from "react"
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

function MediaTile({ item, alt }: { item: BlogGalleryItem; alt: string }) {
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
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt={item.caption || alt} className="h-full w-full object-cover" />
  )
}

/** Galería multimedia del post público: grid si hay pocos elementos, carrusel si hay varios. */
export function BlogMediaGallery({ items, alt = "", className }: BlogMediaGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selected, setSelected] = React.useState(0)

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
          <MediaTile item={items[0]} alt={alt} />
        </div>
        {items[0].caption ? (
          <p className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">{items[0].caption}</p>
        ) : null}
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
                  <MediaTile item={item} alt={`${alt} ${i + 1}`} />
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
    </div>
  )
}
