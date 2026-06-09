"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { withImageKitTransform } from "@/lib/imagekit.config"

type ReviewPhotosGalleryProps = {
  urls: string[]
  altPrefix?: string
  thumbClassName?: string
}

export function ReviewPhotosGallery({
  urls,
  altPrefix = "Foto de reseña",
  thumbClassName = "h-20 w-20",
}: ReviewPhotosGalleryProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (activeIndex === null || !mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [activeIndex, mounted])

  if (urls.length === 0) return null

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${thumbClassName}`}
          >
            <img
              src={withImageKitTransform(url, "reviewThumb")}
              alt={`${altPrefix} ${index + 1}`}
              className="aspect-square h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {activeIndex !== null ? (
                <motion.div
                  key="review-lightbox"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
                  onClick={() => setActiveIndex(null)}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Vista ampliada de foto de reseña"
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(null)}
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                    aria-label="Cerrar"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <motion.img
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    src={withImageKitTransform(urls[activeIndex], "reviewFull")}
                    alt={`${altPrefix} ${activeIndex + 1}`}
                    className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  )
}

type ReviewPhotosPreviewProps = {
  urls: string[]
  sizeClass?: string
}

/** Miniaturas estáticas para el panel de moderación (sin lightbox). */
export function ReviewPhotosPreview({ urls, sizeClass = "h-16 w-16" }: ReviewPhotosPreviewProps) {
  if (urls.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {urls.map((url, index) => (
        <a
          key={`${url}-${index}`}
          href={withImageKitTransform(url, "reviewFull")}
          target="_blank"
          rel="noopener noreferrer"
          className={`overflow-hidden rounded-lg border border-slate-200 ${sizeClass}`}
        >
          <img
            src={withImageKitTransform(url, "reviewThumb")}
            alt={`Foto adjunta ${index + 1}`}
            className="aspect-square h-full w-full object-cover"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  )
}
