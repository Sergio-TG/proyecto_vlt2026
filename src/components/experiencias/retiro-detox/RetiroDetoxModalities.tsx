"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  MODALITIES,
  formatArsPrice,
  type ModalityGroup,
  type ModalityId,
} from "@/lib/retiro-detox-vida-abundante"

type ModalityCopy = {
  name: string
  includes: string[]
}

type RetiroDetoxModalitiesProps = {
  title: string
  subtitle: string
  tabLocal: string
  tabResidential: string
  includesLabel: string
  perPersonNote: string
  modalities: Record<ModalityId, ModalityCopy>
}

export function RetiroDetoxModalities({
  title,
  subtitle,
  tabLocal,
  tabResidential,
  includesLabel,
  perPersonNote,
  modalities,
}: RetiroDetoxModalitiesProps) {
  const [group, setGroup] = useState<ModalityGroup>("residencial")
  const visible = MODALITIES.filter((item) => item.group === group)

  return (
    <section className="bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-lg text-slate-500 font-light leading-relaxed">{subtitle}</p>
          <p className="text-sm font-medium text-slate-400">{perPersonNote}</p>
        </div>

        <div
          role="tablist"
          aria-label={title}
          className="mx-auto mb-10 flex w-full max-w-xl rounded-full bg-white p-1.5 shadow-sm border border-slate-200"
        >
          {(
            [
              { id: "residencial" as const, label: tabResidential },
              { id: "local" as const, label: tabLocal },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={group === tab.id}
              onClick={() => setGroup(tab.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2.5 text-sm sm:text-base font-semibold transition-all duration-300",
                group === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "grid gap-5 md:gap-6",
              visible.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3",
            )}
          >
            {visible.map((item) => {
              const copy = modalities[item.id]
              const highlight = item.id.includes("premium")
              return (
                <article
                  key={item.id}
                  className={cn(
                    "relative flex flex-col rounded-3xl border bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]",
                    highlight
                      ? "border-primary/30 ring-1 ring-primary/15"
                      : "border-slate-100",
                  )}
                >
                  {highlight ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      Premium
                    </span>
                  ) : null}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    {copy.name}
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                    {formatArsPrice(item.price)}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    {includesLabel}
                  </p>
                  <ul className="space-y-3 flex-grow">
                    {copy.includes.map((line) => (
                      <li key={line} className="flex gap-2.5 text-slate-600 text-sm sm:text-[15px] leading-snug">
                        <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
