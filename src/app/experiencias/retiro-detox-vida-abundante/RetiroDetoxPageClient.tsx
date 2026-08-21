"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import {
  Apple,
  FileText,
  GlassWater,
  MessageCircle,
  Moon,
  Salad,
  Sparkles,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RetiroDetoxHero } from "@/components/experiencias/retiro-detox/RetiroDetoxHero"
import { RetiroDetoxMiniGallery } from "@/components/experiencias/retiro-detox/RetiroDetoxMiniGallery"
import { RetiroDetoxSchedule } from "@/components/experiencias/retiro-detox/RetiroDetoxSchedule"
import { RetiroDetoxStaff } from "@/components/experiencias/retiro-detox/RetiroDetoxStaff"
import { RetiroDetoxTestimonials } from "@/components/experiencias/retiro-detox/RetiroDetoxTestimonials"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import {
  AGENCY_WHATSAPP_PHONE,
  LIVING_FOOD_GALLERY_FILES,
  RETIRO_DETOX_PROVIDER_ID,
  RETIRO_DETOX_SLUG,
  waMeHref,
} from "@/lib/retiro-detox-vida-abundante"
import { trackConsultAgency, trackServiceInterest } from "@/services/analytics"

const RetiroDetoxModalities = dynamic(
  () =>
    import("@/components/experiencias/retiro-detox/RetiroDetoxModalities").then(
      (m) => m.RetiroDetoxModalities,
    ),
  { ssr: true },
)

const pillarIcons = [Moon, Salad, Sparkles] as const
const livingFoodIcons = [Apple, Utensils, GlassWater] as const

export default function RetiroDetoxPageClient() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.retiroDetox

  const agencyPhone = (
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE || AGENCY_WHATSAPP_PHONE
  ).replace(/[^\d]/g, "")
  const agencyHref = waMeHref(agencyPhone, p.whatsappPrefillAgency)
  const pdfHref = `/experiencias/${RETIRO_DETOX_SLUG}/programa`
  const pillars = p.pillars ?? []
  const livingFoodItems = p.livingFoodItems ?? []
  const teamMembers = p.teamMembers ?? []
  const scheduleBlocks = p.scheduleBlocks ?? []

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <RetiroDetoxHero
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
        badges={p.badges}
        heroAlt={p.heroAlt}
      />

      <section className="container mx-auto px-4 pt-20 md:pt-24 pb-12 md:pb-16 max-w-6xl">
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
          {pillars.map((pillar, index) => {
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

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="mt-10 md:mt-14 rounded-3xl border border-slate-100 bg-slate-50/80 p-7 sm:p-8 md:p-10"
        >
          <h3 className="text-xl sm:text-2xl md:text-[1.65rem] font-bold tracking-tight text-slate-900 mb-5 md:mb-6">
            {p.whyDetoxTitle}
          </h3>
          <div className="space-y-5 max-w-4xl">
            <p className="text-slate-600 leading-relaxed font-light">{p.whyDetoxP1}</p>
            <p className="border-l-[3px] border-primary/45 pl-4 md:pl-5 text-slate-700 leading-relaxed">
              {p.whyDetoxP2}
            </p>
          </div>
        </motion.article>
      </section>

      <section className="container mx-auto px-4 pb-16 md:pb-20 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 p-6 sm:p-8 md:p-10"
        >
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 space-y-3">
            <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
              {p.livingFoodTitle}
            </h3>
            <p className="text-base md:text-lg text-slate-500 font-light leading-relaxed">
              {p.livingFoodSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {livingFoodItems.map((item, index) => {
              const Icon = livingFoodIcons[index] ?? Apple
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  className="rounded-2xl border border-slate-100 bg-white/90 p-6 md:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 leading-relaxed font-light text-[0.95rem]">
                    {item.description}
                  </p>
                </motion.article>
              )
            })}
          </div>

          <RetiroDetoxMiniGallery
            files={LIVING_FOOD_GALLERY_FILES}
            alts={p.livingFoodGalleryAlts ?? []}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </motion.div>

        <RetiroDetoxStaff title={p.teamTitle} members={teamMembers} />
      </section>

      <RetiroDetoxSchedule
        title={p.scheduleTitle}
        blocks={scheduleBlocks}
        galleryAlts={p.scheduleGalleryAlts ?? []}
      />

      <RetiroDetoxModalities
        title={p.modalitiesTitle}
        subtitle={p.modalitiesSubtitle}
        tabLocal={p.tabLocal}
        tabResidential={p.tabResidential}
        includesLabel={p.includesLabel}
        excludesLabel={p.excludesLabel}
        reserveLabel={p.reserveLabel}
        reserveAria={p.reserveAria}
        perPersonNote={p.perPersonNote}
        modalities={p.modalities}
        agencyPhone={agencyPhone}
        whatsappPrefillModality={p.whatsappPrefillModality}
        onReserve={(modalityName) => {
          trackConsultAgency(RETIRO_DETOX_PROVIDER_ID)
          trackServiceInterest(`${p.heroTitle} — ${modalityName}`)
        }}
      />

      <RetiroDetoxTestimonials
        title={p.testimonialsTitle}
        subtitle={p.testimonialsSubtitle}
        items={p.testimonials ?? []}
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

          <div className="flex flex-col items-center gap-4">
            <Button
              asChild
              size="lg"
              className="min-h-12 h-12 sm:h-14 w-full max-w-md rounded-full px-8 text-base font-bold shadow-lg shadow-primary/20"
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
                {p.ctaPrimary}
              </a>
            </Button>

            <Link
              href={pdfHref}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 underline-offset-4 hover:text-primary hover:underline transition-colors"
            >
              <FileText className="h-4 w-4" />
              {p.pdfLabel}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
