"use client"

import * as React from "react"
import Image from "next/image"
import { createPortal } from "react-dom"

export interface GaleriaLightboxProps {
  fullUrls: string[]
  thumbUrls: string[]
  nombreAlojamiento: string
  initialIndex: number
  onClose: () => void
  onImageError: (index: number) => void
  failedIndexes: Set<number>
}

function getFocusable(root: HTMLElement | null) {
  if (!root) return []
  const selector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
  )
}

export function GaleriaLightbox({
  fullUrls,
  thumbUrls,
  nombreAlojamiento,
  initialIndex,
  onClose,
  onImageError,
  failedIndexes,
}: GaleriaLightboxProps) {
  const [mounted, setMounted] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const modalRef = React.useRef<HTMLDivElement | null>(null)
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null)
  const thumbsStripRef = React.useRef<HTMLDivElement | null>(null)
  const touchStartXRef = React.useRef<number | null>(null)

  const valid = React.useMemo(() => {
    return fullUrls
      .map((full, i) => ({ full, thumb: thumbUrls[i] ?? full, index: i }))
      .filter((x) => !failedIndexes.has(x.index))
  }, [failedIndexes, fullUrls, thumbUrls])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (valid.length === 0) return
    const startIndex = Math.max(0, valid.findIndex((v) => v.index === initialIndex))
    setActive(startIndex === -1 ? 0 : startIndex)
  }, [initialIndex, valid])

  React.useEffect(() => {
    if (valid.length === 0) {
      onClose()
      return
    }
    setActive((i) => (i >= valid.length ? Math.max(0, valid.length - 1) : i))
  }, [onClose, valid.length])

  React.useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  const goPrev = React.useCallback(() => {
    if (valid.length <= 1) return
    setActive((i) => (i - 1 + valid.length) % valid.length)
  }, [valid.length])

  const goNext = React.useCallback(() => {
    if (valid.length <= 1) return
    setActive((i) => (i + 1) % valid.length)
  }, [valid.length])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
        return
      }

      if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
        return
      }

      if (e.key === "Tab") {
        const root = modalRef.current
        const focusable = getFocusable(root)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const current = document.activeElement as HTMLElement | null

        if (e.shiftKey) {
          if (!current || current === first || !root?.contains(current)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (!current || current === last || !root?.contains(current)) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goNext, goPrev, onClose])

  React.useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  React.useEffect(() => {
    const strip = thumbsStripRef.current
    if (!strip) return
    const activeItem = strip.querySelector<HTMLElement>(`[data-thumb-index="${active}"]`)
    if (!activeItem) return
    activeItem.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [active])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches?.[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current
    touchStartXRef.current = null
    if (start == null) return
    const end = e.changedTouches?.[0]?.clientX ?? start
    const delta = end - start
    if (Math.abs(delta) < 50) return
    if (delta > 0) goPrev()
    else goNext()
  }

  if (!mounted || valid.length === 0) return null

  const activeItem = valid[active]
  const total = valid.length

  const modal = (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de fotos de ${nombreAlojamiento}`}
      className="fixed inset-0 bg-black flex flex-col"
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium">
          {active + 1} / {total}
        </span>
        <button
          ref={closeBtnRef}
          autoFocus
          onClick={onClose}
          aria-label="Cerrar galería"
          type="button"
          className="text-white text-2xl leading-none hover:opacity-70 transition-opacity p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center px-12 min-h-0">
        <button
          type="button"
          aria-label="Foto anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl hover:opacity-70 transition-opacity z-10 px-2 cursor-pointer"
          onClick={goPrev}
        >
          ‹
        </button>

        <div className="relative w-full h-full min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden">
              <Image
                src={activeItem.full}
                alt={`${nombreAlojamiento} — foto ${active + 1} de ${total}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                onError={() => onImageError(activeItem.index)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Foto siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl hover:opacity-70 transition-opacity z-10 px-2 cursor-pointer"
          onClick={goNext}
        >
          ›
        </button>
      </div>

      <div
        ref={thumbsStripRef}
        className="flex-shrink-0 flex flex-row gap-2 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-2"
        style={{ height: "88px", minHeight: "88px" }}
      >
        {valid.map((v, i) => (
          <button
            key={v.index}
            onClick={() => setActive(i)}
            type="button"
            data-thumb-index={i}
            className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
              i === active ? "ring-2 ring-white opacity-100 cursor-default" : "opacity-60 hover:opacity-90 cursor-pointer"
            }`}
            style={{ width: "72px", height: "72px", minWidth: "72px", minHeight: "72px" }}
            aria-label={`Ir a la foto ${i + 1}`}
          >
            <Image
              src={v.thumb}
              alt={`Miniatura ${i + 1}`}
              width={72}
              height={72}
              className="object-cover w-full h-full"
              sizes="72px"
              onError={() => onImageError(v.index)}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
