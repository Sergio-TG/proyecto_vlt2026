"use client"

import {
  Backpack,
  Clock3,
  CreditCard,
  Mountain,
  ShieldCheck,
  Sunrise,
  Truck,
} from "lucide-react"
import { motion } from "framer-motion"

const icons = [Clock3, Mountain, Sunrise, Truck, Backpack, ShieldCheck, CreditCard] as const

export function ChampaquiFacts({
  title,
  facts,
}: {
  title: string
  facts: Array<{ title: string; text: string }>
}) {
  return (
    <section className="container mx-auto max-w-6xl px-4 pt-16 md:pt-20 pb-8" aria-labelledby="champaqui-facts-title">
      <h2
        id="champaqui-facts-title"
        className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 text-center mb-8 md:mb-12"
      >
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {facts.map((fact, index) => {
          const Icon = icons[index] ?? Mountain
          return (
            <motion.li
              key={fact.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6 md:p-7"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">{fact.title}</h3>
              <p className="text-slate-600 leading-relaxed font-light text-[0.95rem]">{fact.text}</p>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
