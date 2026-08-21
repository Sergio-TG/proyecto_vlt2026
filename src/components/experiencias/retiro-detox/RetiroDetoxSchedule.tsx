"use client"

import { Moon, Sun, Sunrise } from "lucide-react"
import { motion } from "framer-motion"
import { RetiroDetoxMiniGallery } from "@/components/experiencias/retiro-detox/RetiroDetoxMiniGallery"
import { SCHEDULE_GALLERY_FILES } from "@/lib/retiro-detox-vida-abundante"

const blockIcons = [Sunrise, Sun, Moon] as const

type ScheduleBlock = {
  period: string
  text: string
}

export function RetiroDetoxSchedule({
  title,
  blocks,
  galleryAlts,
}: {
  title: string
  blocks: ScheduleBlock[]
  galleryAlts: string[]
}) {
  return (
    <motion.section
      aria-labelledby="retiro-detox-schedule-title"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="container mx-auto px-4 pb-16 md:pb-20 max-w-6xl"
    >
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 md:p-10">
        <h3
          id="retiro-detox-schedule-title"
          className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 text-center mb-8 md:mb-10"
        >
          {title}
        </h3>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(blocks ?? []).map((block, index) => {
            const Icon = blockIcons[index] ?? Sun
            return (
              <li
                key={block.period}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 md:p-6"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h4 className="text-base md:text-lg font-semibold text-primary mb-2">
                  {block.period}
                </h4>
                <p className="text-sm md:text-[0.95rem] text-slate-600 leading-relaxed">
                  {block.text}
                </p>
              </li>
            )
          })}
        </ul>

        <RetiroDetoxMiniGallery
          files={SCHEDULE_GALLERY_FILES}
          alts={galleryAlts}
          className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
      </div>
    </motion.section>
  )
}
