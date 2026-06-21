"use client"

import { GaleriaAlojamiento } from "@/components/alojamientos/GaleriaAlojamiento"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

/**
 * Misma UX que la galería de alojamientos (GaleriaGrid + GaleriaLightbox).
 * Título visible: "Galería"; `photoContextTitle` solo alimenta textos alt/ARIA (ej. Termas del Sol).
 */
export function TermasGallery({
  thumbUrls,
  fullUrls,
  photoContextTitle,
}: {
  thumbUrls: string[]
  fullUrls: string[]
  photoContextTitle: string
}) {
  const { locale } = useLanguage()
  const heading = getSiteCopy(locale).pages.accommodationDetail.gallery

  if (!thumbUrls.length || !fullUrls.length) return null

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">{heading}</h3>
      <GaleriaAlojamiento
        thumbUrls={thumbUrls}
        fullUrls={fullUrls}
        nombreAlojamiento={photoContextTitle}
      />
    </div>
  )
}
