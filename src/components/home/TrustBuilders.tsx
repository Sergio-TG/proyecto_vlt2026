"use client"

import { ShieldCheck, Camera, Map, Handshake } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const icons = [ShieldCheck, Camera, Map, Handshake] as const

export function TrustBuilders() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {copy.trustBuilders.items.map((item, index) => {
            const Icon = icons[index]
            const colors = [
              { color: "text-blue-500", bg: "bg-blue-50" },
              { color: "text-purple-500", bg: "bg-purple-50" },
              { color: "text-green-500", bg: "bg-green-50" },
              { color: "text-orange-500", bg: "bg-orange-50" },
            ][index]
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300"
              >
                <div className={`w-16 h-16 ${colors.bg} ${colors.color} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">{item.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{item.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
