"use client"

import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChampaquiHero({
  title,
  subtitle,
  elevation,
  byline,
  priceLabel,
  priceHint,
  reserveCta,
  heroAlt,
  imageSrc,
  reserveHref,
  onReserve,
}: {
  title: string
  subtitle: string
  elevation?: string
  byline: string
  priceLabel: string
  priceHint: string
  reserveCta: string
  heroAlt: string
  imageSrc: string
  reserveHref: string
  onReserve: () => void
}) {
  return (
    <section className="bg-white">
      <div className="relative h-[380px] sm:h-[450px] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={heroAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={80}
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-800" aria-hidden />
        )}
        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/35 to-black/20"
          aria-hidden
        />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
              {byline}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl sm:max-w-3xl text-sm sm:text-base md:text-lg text-white/90 text-center font-light leading-relaxed">
              {subtitle}{" "}
              {elevation ? <span className="inline-block">{elevation}</span> : null}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-10 sm:-mt-12 w-full max-w-md px-4 pb-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 text-center shadow-xl">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{priceLabel}</p>
          <p className="mt-1 text-sm text-slate-500">{priceHint}</p>
          <Button
            asChild
            size="lg"
            className="mt-4 min-h-12 h-12 sm:h-14 w-full rounded-full px-8 text-base font-bold shadow-lg shadow-primary/20"
          >
            <a
              href={reserveHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onReserve}
            >
              <MessageCircle className="h-5 w-5" />
              {reserveCta}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
