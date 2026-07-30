"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const SEO_IMAGE_SRC = {
  entorno: "https://ik.imagekit.io/vivilastermas/entorno/seo/seo-aerea-rio-el-durazno.webp",
  cabanas: "https://ik.imagekit.io/vivilastermas/entorno/seo/seo-cabana-sierras.webp",
  termas: "https://ik.imagekit.io/vivilastermas/entorno/seo/seo-piscina-con-vista-sierras.webp",
} as const

function SeoImage({
  src,
  alt,
  priority = false,
  className = "",
  delay = 0.1,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8 }}
      className={`relative rounded-2xl shadow-md overflow-hidden aspect-[4/3] ${className}`.trim()}
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </motion.div>
    </motion.div>
  )
}

function SeoText({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HomeSeoContent() {
  const { locale } = useLanguage()
  const { homeSeo: copy } = getSiteCopy(locale)

  return (
    <section className="py-16 bg-slate-50/50 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
          {/* Fila 1 — Introducción y Entorno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <SeoText className="space-y-4" delay={0.05}>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                {copy.intro.title}
              </h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
                <strong className="font-semibold text-slate-800">{copy.intro.brand}</strong>
                {copy.intro.bodyBefore}
                <strong className="font-semibold text-slate-800">{copy.intro.highlight}</strong>
                {copy.intro.bodyAfter}
              </p>
            </SeoText>
            <SeoImage
              src={SEO_IMAGE_SRC.entorno}
              alt={copy.intro.imageAlt}
              priority
              delay={0.15}
            />
          </div>

          {/* Fila 2 — Alojamientos (invertida en desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <SeoImage
              src={SEO_IMAGE_SRC.cabanas}
              alt={copy.stays.imageAlt}
              className="order-2 md:order-1"
              delay={0.15}
            />
            <SeoText className="space-y-3 order-1 md:order-2" delay={0.05}>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                {copy.stays.title}
              </h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
                {copy.stays.bodyBefore}
                <strong className="font-semibold text-slate-800">{copy.stays.highlight1}</strong>
                {copy.stays.bodyMid}
                <strong className="font-semibold text-slate-800">{copy.stays.highlight2}</strong>
                {copy.stays.bodyAfter}
              </p>
            </SeoText>
          </div>

          {/* Fila 3 — Relax y Aventura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <SeoText className="space-y-3" delay={0.05}>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                {copy.relax.title}
              </h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
                {copy.relax.bodyBefore}
                <strong className="font-semibold text-slate-800">{copy.relax.highlight}</strong>
                {copy.relax.bodyAfter}
              </p>
            </SeoText>
            <SeoImage
              src={SEO_IMAGE_SRC.termas}
              alt={copy.relax.imageAlt}
              delay={0.15}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
