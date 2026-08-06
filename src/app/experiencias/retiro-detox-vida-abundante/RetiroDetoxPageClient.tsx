"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  Leaf,
  MessageCircle,
  Moon,
  Salad,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RetiroDetoxHero } from "@/components/experiencias/retiro-detox/RetiroDetoxHero"
import { RetiroDetoxModalities } from "@/components/experiencias/retiro-detox/RetiroDetoxModalities"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import {
  AGENCY_WHATSAPP_PHONE,
  PROVIDER_WHATSAPP_PHONE,
  RETIRO_DETOX_PROVIDER_ID,
  RETIRO_DETOX_SLUG,
  waMeHref,
} from "@/lib/retiro-detox-vida-abundante"
import { trackConsultAgency, trackDirectProvider, trackServiceInterest } from "@/services/analytics"

const pillarIcons = [Moon, Salad, Sparkles] as const

export default function RetiroDetoxPageClient() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.retiroDetox

  const agencyPhone = (
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE || AGENCY_WHATSAPP_PHONE
  ).replace(/[^\d]/g, "")
  const agencyHref = waMeHref(agencyPhone, p.whatsappPrefillAgency)
  const providerHref = waMeHref(PROVIDER_WHATSAPP_PHONE, p.whatsappPrefillDirect)
  const pdfHref = `/experiencias/${RETIRO_DETOX_SLUG}/programa`

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <RetiroDetoxHero
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
        badges={p.badges}
        heroAlt={p.heroAlt}
      />

      <section className="container mx-auto px-4 py-20 md:py-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-3"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            {p.pillarsTitle}
          </h2>
          <p className="text-lg text-slate-500 font-light leading-relaxed">{p.pillarsSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {p.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index] ?? Sparkles
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.1, duration: 0.65 }}
                className="rounded-3xl border border-slate-100 bg-slate-50/60 p-7 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-light">{pillar.description}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 md:pb-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 md:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Leaf className="h-5 w-5" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                {p.foodTitle}
              </h2>
              <p className="text-lg text-slate-500 font-light">{p.foodSubtitle}</p>
              <p className="text-slate-600 leading-relaxed">{p.foodBody}</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{p.teamTitle}</h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.teamRoles.map((role) => (
                  <li
                    key={role}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      <RetiroDetoxModalities
        title={p.modalitiesTitle}
        subtitle={p.modalitiesSubtitle}
        tabLocal={p.tabLocal}
        tabResidential={p.tabResidential}
        includesLabel={p.includesLabel}
        perPersonNote={p.perPersonNote}
        modalities={p.modalities}
      />

      <section className="container mx-auto px-4 py-20 md:py-24 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              {p.ctaTitle}
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">{p.ctaSubtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 sm:h-14 rounded-full px-7 text-base font-bold shadow-lg shadow-primary/20"
            >
              <a
                href={agencyHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackConsultAgency(RETIRO_DETOX_PROVIDER_ID)
                  trackServiceInterest(p.heroTitle)
                }}
              >
                <MessageCircle className="h-5 w-5" />
                {p.ctaAgency}
              </a>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 sm:h-14 rounded-full px-7 text-base font-bold border-2"
            >
              <a
                href={providerHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackDirectProvider(RETIRO_DETOX_PROVIDER_ID)}
              >
                {p.ctaProvider}
              </a>
            </Button>
          </div>

          <Link
            href={pdfHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 underline-offset-4 hover:text-primary hover:underline transition-colors"
          >
            <FileText className="h-4 w-4" />
            {p.pdfLabel}
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
