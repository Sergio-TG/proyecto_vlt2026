"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

export default function TerminosPage() {
  const { locale } = useLanguage()
  const l = getSiteCopy(locale).pages.legal.terminos

  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{l.title}</h1>

          <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{l.h1}</h2>
              <p>{l.p1}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{l.h2}</h2>
              <p>{l.p2}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{l.h3}</h2>
              <p>{l.p3}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{l.h4}</h2>
              <p>{l.p4}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{l.h5}</h2>
              <p>{l.p5}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
