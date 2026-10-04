"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Compass, Map, Sun, Heart, Stars, Sparkles } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import {
  RecommendedProvidersSection,
  type ProviderGalleryUrls,
} from "@/components/experiencias/RecommendedProvidersSection"
import { trackServiceInterest } from "@/services/analytics"
import { RETIRO_DETOX_SLUG, buildRetiroHeroImageUrl } from "@/lib/retiro-detox-vida-abundante"
import { CHAMPAQUI_SLUG } from "@/lib/oscura-overa-champaqui"

const IMAGE_META = [
  {
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop",
    icon: <Map className="w-6 h-6" aria-hidden="true" />,
    delay: 0.1,
  },
  {
    image:
      "https://ik.imagekit.io/vivilastermas/entorno/experiencias/ritual-satori-reiki-japones2.webp?updatedAt=1790448105963",
    icon: <Sparkles className="w-6 h-6" aria-hidden="true" />,
    delay: 0.15,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/yoga-mar.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Heart className="w-6 h-6" aria-hidden="true" />,
    delay: 0.2,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/sound-healing002.webp?updatedAt=1784166431956",
    icon: <Sun className="w-6 h-6" aria-hidden="true" />,
    delay: 0.3,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/puntos-de-interes.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Sun className="w-6 h-6" aria-hidden="true" />,
    delay: 0.4,
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1663036377788-a60733e5fb43?q=80&w=2070&auto=format&fit=crop",
    icon: <Compass className="w-6 h-6" aria-hidden="true" />,
    delay: 0.5,
  },
  {
    image: "https://images.unsplash.com/photo-1731332066050-47efac6e884f?q=80&w=2070&auto=format&fit=crop",
    icon: <Stars className="w-6 h-6" aria-hidden="true" />,
    delay: 0.6,
  },
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export default function ExperienciasPageClient({
  providerGalleries = {},
}: {
  providerGalleries?: Record<string, ProviderGalleryUrls>
}) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.experiencias

  const experiences = p.items.map((item, index) => ({
    ...item,
    ...IMAGE_META[index],
  }))

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-white">
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt={p.heroAlt}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-bold mb-4 drop-shadow-2xl tracking-tighter"
          >
            {p.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            {p.heroSubtitle}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <Link
            href={`/experiencias/${RETIRO_DETOX_SLUG}`}
            onClick={() => trackServiceInterest(p.featuredRetreat.title)}
            className="group relative block overflow-hidden rounded-2rem border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="relative h-88 sm:h-104 md:h-120 lg:h-136">
              <img
                src={buildRetiroHeroImageUrl("vista-exterior-lavandas.webp")}
                alt={p.featuredRetreat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/15" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
                <span className="mb-3 inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                  {p.featuredRetreat.eyebrow} · {p.featuredRetreat.dates}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-3xl">
                  {p.featuredRetreat.title}
                </h2>
                <p className="max-w-2xl text-base sm:text-lg text-white/90 font-light leading-relaxed mb-5">
                  {p.featuredRetreat.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
                  {p.featuredRetreat.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <Link
            href={`/experiencias/${CHAMPAQUI_SLUG}`}
            onClick={() => trackServiceInterest(p.featuredChampaqui.title)}
            className="group relative block overflow-hidden rounded-4xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="relative h-95 sm:h-112,5 overflow-hidden">
              <img
                src="https://ik.imagekit.io/vivilastermas/prestadores/oscura-overa/excursion94/cerro-champaqui-panoramica.webp"
                alt={p.featuredChampaqui.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/15" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
                <span className="mb-3 inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                  {p.featuredChampaqui.eyebrow} · {p.featuredChampaqui.price}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-3xl">
                  {p.featuredChampaqui.title}
                </h2>
                <p className="max-w-2xl text-base sm:text-lg text-white/90 font-light leading-relaxed mb-5">
                  {p.featuredChampaqui.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
                  {p.featuredChampaqui.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {experiences.map((exp) => {
            const ctaLabel = exp.cta ?? p.consultBtn
            const href = exp.href ?? "/contacto"
            const isExternal = Boolean(exp.external)
            const imageAlt = exp.imageAlt ?? exp.title

            return (
            <motion.article
              key={exp.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: exp.delay, duration: 0.8 }}
              className="group bg-slate-50/50 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-700 border border-slate-100 flex flex-col h-full"
            >
              <div className="relative h-80 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 1.5 }}
                  src={exp.image}
                  alt={imageAlt}
                  width={828}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-xl p-4 rounded-3xl text-black shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  {exp.icon}
                </div>
              </div>
              <div className="p-10 flex flex-col grow space-y-4">
                {exp.tag ? (
                  <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {exp.tag}
                  </span>
                ) : null}
                <h3 className="text-3xl font-bold group-hover:text-primary transition-colors duration-300 tracking-tight">{exp.title}</h3>
                <p className="text-slate-500 mb-6 grow leading-relaxed text-lg font-light">{exp.description}</p>
                {isExternal ? (
                  <Button asChild size="lg" variant="outline" className="w-full h-14 gap-2.5 rounded-full text-lg font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackServiceInterest(exp.title)}
                      aria-label={`${ctaLabel}: ${exp.title} (WhatsApp)`}
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      {ctaLabel}
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="outline" className="w-full h-14 rounded-full text-lg font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20">
                    <Link href={href} onClick={() => trackServiceInterest(exp.title)}>
                      {ctaLabel}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.article>
            )
          })}
        </div>
      </div>

      <RecommendedProvidersSection galleries={providerGalleries} />
    </div>
  )
}
