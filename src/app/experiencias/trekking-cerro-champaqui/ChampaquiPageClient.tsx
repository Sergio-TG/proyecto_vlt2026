"use client"

import { useMemo, useState } from "react"
import { ChampaquiAdviceModal } from "@/components/experiencias/oscura-overa/ChampaquiAdviceModal"
import { ChampaquiFacts } from "@/components/experiencias/oscura-overa/ChampaquiFacts"
import { ChampaquiGallery, type ChampaquiGalleryItem } from "@/components/experiencias/oscura-overa/ChampaquiGallery"
import { ChampaquiHero } from "@/components/experiencias/oscura-overa/ChampaquiHero"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import {
  FEATURED_EXCURSION_ID,
  OSCURA_OVERA_PROVIDER_ID,
  OSCURA_OVERA_WHATSAPP_PHONE,
  UNSURE_EXCURSION_ID,
  getExcursionLabels,
  waMeHref,
} from "@/lib/oscura-overa-champaqui"
import { trackConsultAgency, trackServiceInterest } from "@/services/analytics"

export default function ChampaquiPageClient({
  galleryItems,
  heroSrc,
}: {
  galleryItems: ChampaquiGalleryItem[]
  heroSrc: string
}) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale).pages.oscuraOveraChampaqui
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(UNSURE_EXCURSION_ID)

  const featuredLabel = useMemo(() => {
    const item = copy.excursions[FEATURED_EXCURSION_ID]
    return item ? `${item.name} (${item.detail})` : copy.heroTitle
  }, [copy])

  const reserveHref = waMeHref(
    OSCURA_OVERA_WHATSAPP_PHONE,
    copy.whatsappReservePrefill(featuredLabel),
  )

  function openAdvice() {
    setSelectedId(UNSURE_EXCURSION_ID)
    setOpen(true)
    trackServiceInterest(copy.adviceCta)
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ChampaquiHero
        title={copy.heroTitle}
        subtitle={copy.heroSubtitle}
        elevation={copy.heroElevation}
        byline={copy.providerByline}
        priceLabel={copy.priceLabel}
        priceHint={copy.priceHint}
        reserveCta={copy.reserveCta}
        heroAlt={copy.heroAlt}
        imageSrc={heroSrc}
        reserveHref={reserveHref}
        onReserve={() => {
          trackConsultAgency(OSCURA_OVERA_PROVIDER_ID)
          trackServiceInterest(copy.heroTitle)
        }}
      />

      <ChampaquiFacts title={copy.factsTitle} facts={copy.facts} />

      <ChampaquiGallery title={copy.galleryTitle} items={galleryItems} alts={copy.galleryAlts} />

      <section className="container mx-auto max-w-3xl px-4 py-16 md:py-24 text-center">
        <p className="text-base md:text-lg text-slate-600 font-light leading-relaxed mb-8">
          {copy.adviceKicker}
        </p>
        <Button
          type="button"
          size="lg"
          className="min-h-12 h-12 sm:h-14 rounded-full px-8 text-base font-bold"
          onClick={openAdvice}
        >
          {copy.adviceCta}
        </Button>
      </section>

      <ChampaquiAdviceModal
        open={open}
        onOpenChange={setOpen}
        selectedId={selectedId}
        copy={copy}
        locale={locale}
      />
    </div>
  )
}
