"use client"

import { memo, useCallback, useMemo, useState, type KeyboardEvent } from "react"
import { Check, MessageCircle, Star, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MODALITIES,
  formatArsPrice,
  waMeHref,
  type ModalityGroup,
  type ModalityId,
} from "@/lib/retiro-detox-vida-abundante"

type ModalityCopy = {
  name: string
  tagline: string
  includes: string[]
  featuredIncludes?: string[]
  excludes?: string[]
}

type RetiroDetoxModalitiesProps = {
  title: string
  subtitle: string
  tabLocal: string
  tabResidential: string
  includesLabel: string
  excludesLabel: string
  reserveLabel: string
  reserveAria: (name: string) => string
  perPersonNote: string
  modalities: Record<ModalityId, ModalityCopy>
  agencyPhone: string
  whatsappPrefillModality: (name: string) => string
  onReserve?: (modalityName: string) => void
}

const TABS: ModalityGroup[] = ["residencial", "local"]

const ModalityCard = memo(function ModalityCard({
  id,
  price,
  copy,
  includesLabel,
  excludesLabel,
  reserveLabel,
  reserveAriaLabel,
  reserveHref,
  onReserve,
}: {
  id: ModalityId
  price: number
  copy: ModalityCopy
  includesLabel: string
  excludesLabel: string
  reserveLabel: string
  reserveAriaLabel: string
  reserveHref: string
  onReserve?: (modalityName: string) => void
}) {
  const highlight = id.includes("premium")
  const includes = copy?.includes ?? []
  const featured = copy?.featuredIncludes ?? []
  const excludes = copy?.excludes ?? []

  return (
    <article
      className={cn(
        "relative mx-auto flex h-full w-full min-w-0 max-w-[420px] flex-col justify-between rounded-3xl border bg-white p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]",
        highlight ? "border-primary/30 ring-1 ring-primary/15" : "border-slate-200",
      )}
    >
      {highlight ? (
        <span
          className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          aria-hidden="true"
        >
          Premium
        </span>
      ) : null}

      <div>
        <h3 className="mb-1 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight text-balance">
          {copy.name}
        </h3>
        <p className="mb-3 text-xs md:text-sm italic leading-snug text-slate-600">
          {copy.tagline}
        </p>
        <p className="mb-5 text-3xl sm:text-4xl font-bold text-primary leading-none">
          {formatArsPrice(price)}
        </p>

        <ul className="space-y-3" aria-label={includesLabel}>
          {includes.map((line) => (
            <li key={line} className="flex gap-2.5 text-slate-700 text-sm sm:text-[15px] leading-snug">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
          {featured.map((line) => (
            <li
              key={line}
              className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm sm:text-[15px] leading-snug text-amber-950"
            >
              <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-600 mt-0.5" aria-hidden="true" />
              <span className="font-semibold">{line}</span>
            </li>
          ))}
        </ul>

        {excludes.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={excludesLabel}>
            {excludes.map((line) => (
              <li key={line}>
                <span className="inline-flex max-w-full items-start gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs md:text-sm text-slate-700">
                  <X className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  {line}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-6">
        <a
          href={reserveHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={reserveAriaLabel}
          onClick={() => onReserve?.(copy.name)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {reserveLabel}
        </a>
      </div>
    </article>
  )
})

export const RetiroDetoxModalities = memo(function RetiroDetoxModalities({
  title,
  subtitle,
  tabLocal,
  tabResidential,
  includesLabel,
  excludesLabel,
  reserveLabel,
  reserveAria,
  perPersonNote,
  modalities,
  agencyPhone,
  whatsappPrefillModality,
  onReserve,
}: RetiroDetoxModalitiesProps) {
  const [group, setGroup] = useState<ModalityGroup>("residencial")

  const tabs = useMemo(
    () =>
      [
        { id: "residencial" as const, label: tabResidential },
        { id: "local" as const, label: tabLocal },
      ] as const,
    [tabLocal, tabResidential],
  )

  const visible = useMemo(
    () => MODALITIES.filter((item) => item.group === group),
    [group],
  )

  const onTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, current: ModalityGroup) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const currentIndex = TABS.indexOf(current)
    const delta = event.key === "ArrowRight" ? 1 : -1
    const next = TABS[(currentIndex + delta + TABS.length) % TABS.length]
    setGroup(next)
    document.getElementById(`retiro-detox-tab-${next}`)?.focus()
  }, [])

  const headingId = "retiro-detox-modalities-title"

  return (
    <section
      className="bg-slate-50 border-y border-slate-200"
      aria-labelledby={headingId}
    >
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 space-y-3">
          <h2
            id={headingId}
            className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900"
          >
            {title}
          </h2>
          <p className="text-lg text-slate-600 font-light leading-relaxed">{subtitle}</p>
          <p className="text-sm font-medium text-slate-600">{perPersonNote}</p>
        </div>

        <div
          role="tablist"
          aria-label={title}
          className="mx-auto mb-10 flex w-full max-w-xl rounded-full bg-white p-1.5 shadow-sm border border-slate-200"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`retiro-detox-tab-${tab.id}`}
              aria-controls={`retiro-detox-panel-${tab.id}`}
              aria-selected={group === tab.id}
              tabIndex={group === tab.id ? 0 : -1}
              onClick={() => setGroup(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, tab.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2.5 text-sm sm:text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                group === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={group}
            id={`retiro-detox-panel-${group}`}
            role="tabpanel"
            aria-labelledby={`retiro-detox-tab-${group}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mx-auto grid w-full items-stretch gap-6",
              group === "residencial"
                ? "max-w-4xl grid-cols-1 md:grid-cols-2"
                : "max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {visible.map((item) => {
              const copy = modalities?.[item.id]
              if (!copy) return null
              const prefill =
                typeof whatsappPrefillModality === "function"
                  ? whatsappPrefillModality(copy.name)
                  : copy.name
              const ariaLabel =
                typeof reserveAria === "function"
                  ? reserveAria(copy.name)
                  : `${reserveLabel} ${copy.name}`
              return (
                <ModalityCard
                  key={item.id}
                  id={item.id}
                  price={item.price}
                  copy={copy}
                  includesLabel={includesLabel}
                  excludesLabel={excludesLabel}
                  reserveLabel={reserveLabel}
                  reserveAriaLabel={ariaLabel}
                  reserveHref={waMeHref(agencyPhone, prefill)}
                  onReserve={onReserve}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
})
