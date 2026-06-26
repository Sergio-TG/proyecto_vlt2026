"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Eye, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const benefitIcons = [Eye, MessageCircle, ShieldCheck] as const
const benefitColors = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
] as const

import { SOCIOS_HERO_IMAGE } from "@/lib/socios-hero"

const HERO_IMAGE = `${SOCIOS_HERO_IMAGE}?q=80&w=2070&auto=format&fit=crop`

export default function SociosLandingPage() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.socios

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
          <img src={HERO_IMAGE} alt={p.heroAlt} className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4 container mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl tracking-tight max-w-5xl"
          >
            {p.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-lg md:text-2xl max-w-3xl font-light drop-shadow-md text-white/90"
          >
            {p.heroSubtitle}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{p.benefitsTitle}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          {p.benefits.map((benefit, idx) => {
            const Icon = benefitIcons[idx]
            const colorWrap = benefitColors[idx] ?? benefitColors[0]
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (idx + 1), duration: 0.8 }}
                whileHover={{ y: -8 }}
                className="bg-slate-50/50 p-10 md:p-12 rounded-[2.5rem] text-center space-y-6 hover:bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100"
              >
                <motion.div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${colorWrap}`}
                >
                  <Icon className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900">{benefit.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg font-light">{benefit.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/contacto">
              <Button
                size="lg"
                className="text-lg md:text-xl px-10 md:px-12 py-7 md:py-8 rounded-full shadow-2xl hover:shadow-primary/20 transition-all font-bold gap-2"
              >
                {p.ctaJoin}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          <Link
            href="/socios/portal"
            className="text-sm text-slate-500 hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            {p.ctaPortal}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
