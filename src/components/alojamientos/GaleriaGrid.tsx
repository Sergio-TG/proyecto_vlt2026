"use client"

import * as React from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import type { AccommodationGalleryVideo } from "@/lib/accommodation-gallery.config"

type Overlay = { label: string; count: number }

export interface GaleriaGridProps {
  thumbUrls: string[]
  mainUrl?: string
  nombreAlojamiento: string
  leadVideo?: AccommodationGalleryVideo | null
  onFotoClick: (index: number) => void
  onVideoClick: () => void
  onVerTodas: () => void
  onImageError: (index: number) => void
  failedIndexes: Set<number>
}

function clampIndex(i: number, max: number) {
  if (i < 0) return 0
  if (i > max) return max
  return i
}

function VideoTile({
  thumbUrl,
  alt,
  className,
  onClick,
  sizes,
  priority,
  playLabel,
  badgeLabel,
}: {
  thumbUrl: string
  alt: string
  className: string
  onClick: () => void
  sizes: string
  priority?: boolean
  playLabel: string
  badgeLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playLabel}
      className={`relative w-full h-full overflow-hidden group cursor-pointer ${className}`}
    >
      <Image
        src={thumbUrl}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-colors group-hover:bg-black/45">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-slate-900 text-slate-900" />
          </div>
          {badgeLabel ? (
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function Tile({
  src,
  alt,
  priority,
  sizes,
  className,
  onClick,
  onError,
  overlay,
}: {
  src: string
  alt: string
  priority?: boolean
  sizes: string
  className: string
  onClick: () => void
  onError: () => void
  overlay?: Overlay
}) {
  return (
    <button type="button" onClick={onClick} className={`relative w-full h-full overflow-hidden group cursor-pointer ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        onError={onError}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <span className="text-white font-bold text-sm md:text-base">{overlay.label}</span>
        </div>
      )}
    </button>
  )
}

export function GaleriaGrid({
  thumbUrls,
  mainUrl,
  nombreAlojamiento,
  leadVideo,
  onFotoClick,
  onVideoClick,
  onVerTodas,
  onImageError,
  failedIndexes,
}: GaleriaGridProps) {
  const { locale } = useLanguage()
  const g = getSiteCopy(locale).pages.gallery

  const valid = React.useMemo(() => {
    return thumbUrls.map((u, i) => ({ url: u, index: i })).filter((x) => !failedIndexes.has(x.index))
  }, [failedIndexes, thumbUrls])

  if (valid.length === 0 && !leadVideo) return null

  const videoAlt =
    leadVideo?.variant === "presentation" ? g.presentationVideo : g.videoThumbAlt
  const videoBadge =
    leadVideo?.variant === "presentation" ? g.presentationVideo : undefined

  const total = valid.length + (leadVideo ? 1 : 0)
  const thumbs = leadVideo ? valid.slice(0, 5) : valid.slice(1, 5)
  const main = leadVideo ? null : valid[0]
  const mainSrc = main && main.index === 0 && mainUrl ? mainUrl : main?.url

  const desktopRightGridClass =
    thumbs.length === 1
      ? "grid-cols-1 grid-rows-1"
      : thumbs.length === 2
        ? "grid-cols-2 grid-rows-1"
        : thumbs.length === 3
          ? "grid-cols-2 grid-rows-2"
          : "grid-cols-2 grid-rows-2"

  return (
    <section aria-label={g.ariaGallery(nombreAlojamiento)} className="w-full relative z-50">
      <div className="hidden md:block">
        <div className="w-full h-[500px] rounded-xl overflow-hidden bg-white">
          <div className="w-full h-full flex gap-[2px]">
            <div className="relative h-full" style={{ width: "60%" }}>
              {leadVideo ? (
                <VideoTile
                  thumbUrl={leadVideo.thumbUrl}
                  alt={videoAlt}
                  playLabel={g.playVideo}
                  badgeLabel={videoBadge}
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="h-full rounded-tl-xl overflow-hidden"
                  onClick={onVideoClick}
                />
              ) : main && mainSrc ? (
                <Tile
                  src={mainSrc}
                  alt={g.photoAltIndexed(nombreAlojamiento, 1, total)}
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="h-full rounded-tl-xl overflow-hidden"
                  onClick={() => onFotoClick(main.index)}
                  onError={() => onImageError(main.index)}
                />
              ) : null}
            </div>

            {thumbs.length > 0 && (
              <div className="h-full" style={{ width: "40%" }}>
                <div className={`grid ${desktopRightGridClass} gap-[2px] w-full h-full`}>
                  {thumbs.map((t, i) => {
                    const isThird = thumbs.length >= 3 && i === 1
                    const isLast = i === thumbs.length - 1
                    const shouldOverlay = i === 3 || (thumbs.length < 4 && isLast)
                    const overlay: Overlay | undefined =
                      shouldOverlay && total > 0
                        ? { label: g.verTodasOverlay(total), count: total }
                        : undefined

                    const rounding =
                      (isThird ? "rounded-tr-xl overflow-hidden " : "") +
                      (isLast ? "rounded-br-xl overflow-hidden " : "")

                    const span =
                      thumbs.length === 3 && i === 2 ? "col-span-2" : thumbs.length === 1 ? "col-span-1" : ""

                    const click = shouldOverlay ? onVerTodas : () => onFotoClick(t.index)

                    return (
                      <div key={t.index} className={`relative ${span}`}>
                        <Tile
                          src={t.url}
                          alt={g.photoAltIndexed(nombreAlojamiento, clampIndex(t.index + 1, total), total)}
                          sizes="(min-width: 768px) 40vw, 100vw"
                          className={`h-full ${rounding}`}
                          onClick={click}
                          onError={() => onImageError(t.index)}
                          overlay={overlay}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="w-full h-[280px] relative">
          {leadVideo ? (
            <VideoTile
              thumbUrl={leadVideo.thumbUrl}
              alt={videoAlt}
              playLabel={g.playVideo}
              badgeLabel={videoBadge}
              priority
              sizes="100vw"
              className="absolute inset-0"
              onClick={onVideoClick}
            />
          ) : main && mainSrc ? (
            <button
              type="button"
              className="absolute inset-0 overflow-hidden group cursor-pointer"
              onClick={() => onFotoClick(main.index)}
            >
              <Image
                src={mainSrc}
                alt={g.photoAltIndexed(nombreAlojamiento, 1, total)}
                fill
                sizes="100vw"
                priority
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                onError={() => onImageError(main.index)}
              />
            </button>
          ) : null}
        </div>

        {(leadVideo ? valid.length > 0 : valid.length > 1) && (
          <div className="w-full overflow-x-auto">
            <div className="flex items-stretch w-max">
              {(leadVideo ? valid : valid.slice(1)).map((t, idx) => {
                const strip = leadVideo ? valid : valid.slice(1)
                const isLast = idx === strip.length - 1
                return (
                  <button
                    key={t.index}
                    type="button"
                    className="relative h-20 w-28 flex-none overflow-hidden group cursor-pointer"
                    onClick={isLast ? onVerTodas : () => onFotoClick(t.index)}
                  >
                    <Image
                      src={t.url}
                      alt={g.photoAltIndexed(nombreAlojamiento, clampIndex(t.index + 1, total), total)}
                      fill
                      sizes="112px"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      onError={() => onImageError(t.index)}
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{g.verTodasTiles(total)}</span>
                      </div>
                    )}
                  </button>
                )
              })}
              <button
                type="button"
                className="h-20 px-4 flex-none bg-slate-950 text-white font-bold text-sm"
                onClick={onVerTodas}
              >
                {g.verTodasBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

