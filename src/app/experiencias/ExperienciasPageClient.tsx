"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Compass, Map, Sun, Heart, Stars } from "lucide-react"
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
    icon: <Map className="w-6 h-6" />,
    delay: 0.1,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/yoga-mar.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Heart className="w-6 h-6" />,
    delay: 0.2,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/sound-healing002.webp?updatedAt=1784166431956",
    icon: <Sun className="w-6 h-6" />,
    delay: 0.3,
  },
  {
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/puntos-de-interes.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Sun className="w-6 h-6" />,
    delay: 0.4,
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1663036377788-a60733e5fb43?q=80&w=2070&auto=format&fit=crop",
    icon: <Compass className="w-6 h-6" />,
    delay: 0.5,
  },
  {
    image: "https://images.unsplash.com/photo-1731332066050-47efac6e884f?q=80&w=2070&auto=format&fit=crop",
    icon: <Stars className="w-6 h-6" />,
    delay: 0.6,
  },
]

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
            className="group relative block overflow-hidden rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="relative h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[34rem]">
              <img
                src={buildRetiroHeroImageUrl("vista-exterior-lavandas.webp")}
                alt={p.featuredRetreat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />
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
            className="group relative block overflow-hidden rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="relative h-[380px] sm:h-[450px] overflow-hidden">
              <img
                src="https://ik.imagekit.io/vivilastermas/prestadores/oscura-overa/excursion94/cerro-champaqui-panoramica.webp"
                alt={p.featuredChampaqui.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />
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
          {experiences.map((exp) => (
            <motion.div
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
                  alt={exp.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-xl p-4 rounded-3xl text-black shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  {exp.icon}
                </div>
              </div>
              <div className="p-10 flex flex-col flex-grow space-y-4">
                <h3 className="text-3xl font-bold group-hover:text-primary transition-colors duration-300 tracking-tight">{exp.title}</h3>
                <p className="text-slate-500 mb-6 flex-grow leading-relaxed text-lg font-light">{exp.description}</p>
                <Link href="/contacto" onClick={() => trackServiceInterest(exp.title)}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 rounded-full text-lg font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20"
                  >
                    {p.consultBtn}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <RecommendedProvidersSection galleries={providerGalleries} />
    </div>
  )
}
