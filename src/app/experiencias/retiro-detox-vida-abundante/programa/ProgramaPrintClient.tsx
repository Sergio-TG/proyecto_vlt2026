"use client"

import Link from "next/link"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { MODALITIES, formatArsPrice } from "@/lib/retiro-detox-vida-abundante"

export function ProgramaPrintClient() {
  const { locale } = useLanguage()
  const p = getSiteCopy(locale).pages.retiroDetox

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="print:hidden sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/experiencias/retiro-detox-vida-abundante"
            className="text-sm font-medium text-slate-500 hover:text-primary"
          >
            ← Volver al programa
          </Link>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      <article className="container mx-auto max-w-3xl px-4 py-10 md:py-14 space-y-10 print:py-6">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Centro Vida Abundante · Viví las Termas
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{p.heroTitle}</h1>
          <p className="text-slate-600 leading-relaxed">{p.heroSubtitle}</p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {p.badges.map((badge) => (
              <li
                key={badge}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {badge}
              </li>
            ))}
          </ul>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{p.pillarsTitle}</h2>
          <div className="space-y-3">
            {p.pillars.map((pillar) => (
              <div key={pillar.title}>
                <h3 className="font-semibold text-lg">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">{p.foodTitle}</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{p.foodBody}</p>
          <p className="text-sm font-semibold">{p.teamTitle}: {p.teamRoles.join(" · ")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{p.modalitiesTitle}</h2>
          <p className="text-sm text-slate-500">{p.perPersonNote}</p>
          <div className="space-y-5">
            {MODALITIES.map((item) => {
              const copy = p.modalities[item.id]
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4 break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="font-bold text-lg">{copy.name}</h3>
                    <p className="font-bold text-primary">{formatArsPrice(item.price)}</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                    {copy.includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      </article>
    </div>
  )
}
