"use client"

import { Star, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const testimonialMeta = [
  {
    id: 1,
    name: "Sofia M.",
    image: "https://images.unsplash.com/photo-1475087542963-13ab5e611954?q=80&w=2070&auto=format&fit=crop",
    rating: 5,
    stay: "Cabaña Los Aromos",
  },
  {
    id: 2,
    name: "Lucas R.",
    image: "https://images.unsplash.com/photo-1636344325354-5a2d6d69284b?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    stay: "Refugio del Bosque",
  },
  {
    id: 3,
    name: "Julieta S.",
    image: "https://images.unsplash.com/photo-1674238924463-98712d8cd55d?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    stay: "Cabaña Rhyanon",
  },
  {
    id: 4,
    name: "Mariana Z.",
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/plaza-yacanto.webp?q=80&w=1964&auto=format&fit=crop",
    rating: 5,
    stay: "Departamentos Valle Escondido",
  },
]

export function SocialProof() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)

  const testimonials = testimonialMeta.map((row, i) => ({
    ...row,
    quote: copy.socialProof.testimonials[i]?.quote ?? "",
  }))

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">{copy.socialProof.title}</h2>
          <div className="flex justify-center gap-1 text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-muted-foreground">{copy.socialProof.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
            >
              <img
                src={item.image}
                alt={`${copy.socialProof.title} — ${item.name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <div className="flex gap-1 mb-2 text-yellow-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="font-medium text-sm italic mb-2">&quot;{item.quote}&quot;</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-white/80">{item.stay}</p>
                  </div>
                  <Instagram className="w-5 h-5 text-white/80" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="gap-2">
            <a
              href="https://www.instagram.com/stories/highlights/17857640037151378/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-4 h-4" />
              {copy.socialProof.ctaInstagram}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
