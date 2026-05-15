"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

type FAQItem = {
  question: string
  answer: string
}

type FaqSectionProps = {
  title?: string
  subtitle?: string
  items?: FAQItem[]
}

export default function FaqSection({ title, subtitle, items }: FaqSectionProps) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const f = copy.pages.faq

  const resolvedTitle = title ?? f.title
  const resolvedSubtitle = subtitle ?? f.subtitle
  const resolvedItems =
    items ??
    f.items.map((row) => ({
      question: row.q,
      answer: row.a,
    }))

  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  const leftColumn = resolvedItems.filter((_, idx) => idx % 2 === 0)
  const rightColumn = resolvedItems.filter((_, idx) => idx % 2 !== 0)

  return (
    <section className="px-4 pb-20 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">{resolvedTitle}</h2>
          <p className="mt-3 text-lg text-slate-600">{resolvedSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-5">{leftColumn.map((item, idx) => renderItem(item, idx * 2, openIndex, setOpenIndex))}</div>
          <div className="space-y-5">{rightColumn.map((item, idx) => renderItem(item, idx * 2 + 1, openIndex, setOpenIndex))}</div>
        </div>
      </div>
    </section>
  )
}

function renderItem(
  item: FAQItem,
  index: number,
  openIndex: number | null,
  setOpenIndex: React.Dispatch<React.SetStateAction<number | null>>
) {
  const isOpen = openIndex === index
  return (
    <article
      key={`${item.question}-${index}`}
      className="rounded-sm border border-[#b6eeeb] bg-[#f2f9f9] px-5 py-5 transition-colors duration-200"
    >
      <button
        type="button"
        onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-semibold leading-snug text-slate-900">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ${isOpen ? "mt-4 max-h-52 opacity-100" : "mt-0 max-h-0 opacity-0"}`}
      >
        <p className="border-t border-[#88ded9] pt-4 text-base leading-relaxed text-slate-600">{item.answer}</p>
      </div>
    </article>
  )
}
