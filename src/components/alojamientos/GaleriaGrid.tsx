"use client"

import * as React from "react"
import Image from "next/image"

type Overlay = { label: string; count: number }

export interface GaleriaGridProps {
  thumbUrls: string[]
  nombreAlojamiento: string
  onFotoClick: (index: number) => void
  onVerTodas: () => void
  onImageError: (index: number) => void
  failedIndexes: Set<number>
}

function clampIndex(i: number, max: number) {
  if (i < 0) return 0
  if (i > max) return max
  return i
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
  nombreAlojamiento,
  onFotoClick,
  onVerTodas,
  onImageError,
  failedIndexes,
}: GaleriaGridProps) {
  const valid = React.useMemo(() => {
    return thumbUrls.map((u, i) => ({ url: u, index: i })).filter((x) => !failedIndexes.has(x.index))
  }, [failedIndexes, thumbUrls])

  if (valid.length === 0) return null

  const main = valid[0]
  const thumbs = valid.slice(1, 5)
  const total = valid.length

  const desktopRightGridClass =
    thumbs.length === 1
      ? "grid-cols-1 grid-rows-1"
      : thumbs.length === 2
        ? "grid-cols-2 grid-rows-1"
        : thumbs.length === 3
          ? "grid-cols-2 grid-rows-2"
          : "grid-cols-2 grid-rows-2"

  return (
    <section aria-label={`Galería de fotos de ${nombreAlojamiento}`} className="w-full relative z-50">
      <div className="hidden md:block">
        <div className="w-full h-[500px] rounded-xl overflow-hidden bg-white">
          <div className="w-full h-full flex gap-[2px]">
            <div className="relative h-full" style={{ width: "60%" }}>
              <Tile
                src={main.url}
                alt={`${nombreAlojamiento} — foto 1 de ${total}`}
                priority
                sizes="(min-width: 768px) 60vw, 100vw"
                className="h-full rounded-tl-xl overflow-hidden"
                onClick={() => onFotoClick(main.index)}
                onError={() => onImageError(main.index)}
              />
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
                        ? { label: `Ver todas las fotos (${total})`, count: total }
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
                          alt={`${nombreAlojamiento} — foto ${clampIndex(t.index + 1, total)} de ${total}`}
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
          <button type="button" className="absolute inset-0 overflow-hidden group cursor-pointer" onClick={() => onFotoClick(main.index)}>
            <Image
              src={main.url}
              alt={`${nombreAlojamiento} — foto 1 de ${total}`}
              fill
              sizes="100vw"
              priority
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              onError={() => onImageError(main.index)}
            />
          </button>
        </div>

        {valid.length > 1 && (
          <div className="w-full overflow-x-auto">
            <div className="flex items-stretch w-max">
              {valid.slice(1).map((t, idx) => {
                const isLast = idx === valid.slice(1).length - 1
                return (
                  <button
                    key={t.index}
                    type="button"
                    className="relative h-20 w-28 flex-none overflow-hidden group cursor-pointer"
                    onClick={isLast ? onVerTodas : () => onFotoClick(t.index)}
                  >
                    <Image
                      src={t.url}
                      alt={`${nombreAlojamiento} — foto ${clampIndex(t.index + 1, total)} de ${total}`}
                      fill
                      sizes="112px"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      onError={() => onImageError(t.index)}
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Ver todas ({total})</span>
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
                Ver todas
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

