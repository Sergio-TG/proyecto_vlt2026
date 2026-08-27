"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const FOCUS_CLASS: Record<string, string> = {
  "foto-piedra-champaqui.webp": "object-top",
  "aventura-champaqui.webp": "object-bottom",
}

export type ChampaquiGalleryItem = {
  file: string
  thumb: string
  full: string
}

export function ChampaquiGallery({
  title,
  items,
  alts,
}: {
  title: string
  items: ChampaquiGalleryItem[]
  alts: string[]
}) {
  if (items.length === 0) return null

  return (
    <section
      className="container mx-auto overflow-visible px-4 py-10 md:py-14"
      aria-labelledby="champaqui-gallery-title"
    >
      <h2
        id="champaqui-gallery-title"
        className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 text-center mb-6 md:mb-8"
      >
        {title}
      </h2>
      <ul className="mx-auto my-8 grid max-w-6xl grid-cols-2 gap-4 overflow-visible md:grid-cols-4">
        {items.map((item, index) => {
          const alt = alts[index] ?? alts[index % alts.length] ?? title
          return (
            <li
              key={item.file}
              className="group relative z-0 [@media(hover:hover)_and_(pointer:fine)]:hover:z-40"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-md">
                <Image
                  src={item.thumb}
                  alt={alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className={cn("object-cover", FOCUS_CLASS[item.file] ?? "object-center")}
                />
              </div>

              <div className="pointer-events-none invisible absolute left-1/2 top-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover:visible [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100">
                {/* Preview at intrinsic aspect ratio so the full photo is visible. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.full}
                  alt={alt}
                  className="mx-auto h-auto max-h-[min(80vh,36rem)] w-auto max-w-full rounded-xl shadow-2xl"
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
