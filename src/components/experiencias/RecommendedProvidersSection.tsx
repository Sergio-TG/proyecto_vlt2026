"use client"

import Image from "next/image"
import Link from "next/link"
import { Mountain, MessageCircle, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GaleriaAlojamiento } from "@/components/alojamientos/GaleriaAlojamiento"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { trackServiceInterest } from "@/services/analytics"
import { CHAMPAQUI_SLUG } from "@/lib/oscura-overa-champaqui"

const WHATSAPP_PHONE = "5493546525404"

export type ProviderGalleryUrls = {
  thumbUrls: string[]
  fullUrls: string[]
}

const PROVIDER_META: Record<
  string,
  {
    logo: string
    highlightIcons: [typeof Mountain, typeof ShieldCheck]
  }
> = {
  "oscura-overa": {
    logo: "https://ik.imagekit.io/vivilastermas/prestadores/oscura-overa/logo-oscura-overa.webp?updatedAt=1784166181252",
    highlightIcons: [Mountain, ShieldCheck],
  },
}

export function RecommendedProvidersSection({
  galleries = {},
}: {
  galleries?: Record<string, ProviderGalleryUrls>
}) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const section = copy.pages.experiencias.prestadores
  const galleryHeading = copy.pages.accommodationDetail.gallery

  return (
    <section className="bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            {section.sectionTitle}
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">
            {section.sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {section.items.map((provider, index) => {
            const meta = PROVIDER_META[provider.id]
            const gallery = galleries[provider.id]
            const hasGallery = Boolean(gallery?.thumbUrls?.length && gallery?.fullUrls?.length)
            const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(provider.whatsappPrefill)}`

            return (
              <motion.article
                key={provider.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.1 * index, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className={`group/provider bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-shadow duration-700 border border-slate-100 flex flex-col ${
                  section.items.length === 1 ? "lg:col-span-2" : ""
                }`}
              >
                <div className="p-8 md:p-10 lg:p-12 flex flex-col flex-grow gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="relative shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                      {meta?.logo ? (
                        <Image
                          src={meta.logo}
                          alt={provider.logoAlt}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 group-hover/provider:text-primary transition-colors duration-300">
                        {provider.name}
                      </h3>
                      <p className="mt-1 text-base md:text-lg text-slate-500 font-medium italic">
                        {provider.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-base md:text-lg font-light">
                    {provider.description}
                  </p>

                  {hasGallery && gallery ? (
                    <div className="space-y-4">
                      <h4 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                        {galleryHeading}
                      </h4>
                      <GaleriaAlojamiento
                        thumbUrls={gallery.thumbUrls}
                        fullUrls={gallery.fullUrls}
                        nombreAlojamiento={provider.name}
                      />
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {provider.highlights.map((highlight, hIndex) => {
                      const Icon = meta?.highlightIcons[hIndex] ?? Mountain
                      return (
                        <div
                          key={highlight.title}
                          className="rounded-3xl bg-slate-50/80 border border-slate-100 p-6 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                              <Icon className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold tracking-tight text-slate-900">
                              {highlight.title}
                            </h4>
                          </div>
                          <p className="text-slate-500 leading-relaxed text-sm md:text-base font-light">
                            {highlight.text}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3">
                    {provider.id === "oscura-overa" ? (
                      <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full text-base md:text-lg font-bold">
                        <Link
                          href={`/experiencias/${CHAMPAQUI_SLUG}`}
                          onClick={() => trackServiceInterest(provider.name)}
                        >
                          {copy.pages.experiencias.featuredChampaqui.cta}
                        </Link>
                      </Button>
                    ) : null}
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() => trackServiceInterest(provider.name)}
                    >
                      <Button
                        size="lg"
                        className="w-full sm:w-auto h-14 px-8 rounded-full text-base md:text-lg font-bold gap-2.5 shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 transition-all duration-500"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {section.ctaWhatsapp}
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
