"use client"

import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildRetiroHeroImageUrl, HERO_IMAGE_FILES } from "@/lib/retiro-detox-vida-abundante"

type RetiroDetoxHeroProps = {
  title: string
  subtitle: string
  badges: string[]
  heroAlt: string
}

export function RetiroDetoxHero({ title, subtitle, badges, heroAlt }: RetiroDetoxHeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 35 })
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || paused) return
    const id = window.setInterval(() => {
      emblaApi.scrollNext()
    }, 5200)
    return () => window.clearInterval(id)
  }, [emblaApi, paused])

  return (
    <section
      className="relative h-[min(92vh,900px)] min-h-[640px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_IMAGE_FILES.map((file, index) => (
            <div key={file} className="relative min-w-0 shrink-0 grow-0 basis-full h-full">
              <Image
                src={buildRetiroHeroImageUrl(file)}
                alt={heroAlt}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                quality={80}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-10 bg-black/45" aria-hidden />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center text-white">
        <div className="mx-auto max-w-4xl space-y-5 md:space-y-7">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl font-light text-white/90 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-md"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-30 flex items-center justify-center gap-4 px-4">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {HERO_IMAGE_FILES.map((file, index) => (
            <button
              key={file}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a imagen ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                current === index ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
