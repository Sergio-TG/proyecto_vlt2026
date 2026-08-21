"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { withImageKitTransform } from "@/lib/imagekit.config"
import { RETIRO_TESTIMONIAL_PHOTOS } from "@/lib/retiro-detox-vida-abundante"

type Testimonial = {
  name: string
  quote: string
}

function testimonialSrc(index: number): string {
  const photo = RETIRO_TESTIMONIAL_PHOTOS[index]
  if (!photo) return ""
  const transformed = withImageKitTransform(photo.src, "seoContent")
  return photo.updatedAt ? `${transformed}&updatedAt=${photo.updatedAt}` : transformed
}

function TestimonialCard({
  name,
  quote,
  src,
  delay,
}: {
  name: string
  quote: string
  src: string
  delay: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.65 }}
      className="group relative aspect-[4/3] max-h-[360px] w-full overflow-hidden rounded-2xl shadow-md"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={src}
          alt={`Testimonio de ${name}`}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-1500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-115"
        />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 sm:p-5 text-white opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
        <p className="mb-2 text-xs italic leading-snug sm:text-sm">
          “{quote}”
        </p>
        <p className="text-sm font-bold tracking-tight sm:text-base">{name}</p>
      </div>
    </motion.article>
  )
}

export function RetiroDetoxTestimonials({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: Testimonial[]
}) {
  return (
    <section
      className="border-t border-slate-100 bg-white"
      aria-labelledby="retiro-detox-testimonials-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center md:mb-12">
          <h2
            id="retiro-detox-testimonials-title"
            className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
          >
            {title}
          </h2>
          <p className="text-base font-light leading-relaxed text-slate-500 md:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {(items ?? []).map((item, index) => (
            <TestimonialCard
              key={item.name}
              name={item.name}
              quote={item.quote}
              src={testimonialSrc(index)}
              delay={index * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
