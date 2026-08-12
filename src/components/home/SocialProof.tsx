"use client"

import Image from "next/image"
import { Star, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { withImageKitTransform } from "@/lib/imagekit.config"

const testimonialMeta = [
  {
    id: 1,
    name: "RosarioCeballos38",
    image:
      "https://res.cloudinary.com/dxpy1zqj6/image/upload/f_auto,q_80,w_800/v1778891515/clientes-rc_w0swrm.png",
    rating: 5,
    stay: "Termas del Sol",
    instagramUrl: "https://www.instagram.com/rosarioceballos38/",
  },
  {
    id: 2,
    name: "Guada Pereyra",
    image: withImageKitTransform(
      "https://ik.imagekit.io/vivilastermas/resenas/resena_002.webp",
      "seoContent",
    ),
    rating: 5,
    stay: "Termas del Sol",
    instagramUrl:
      "https://www.instagram.com/p/DZ2Q1bnDvBc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: 3,
    name: "soledadmiranda08",
    image: `${withImageKitTransform(
      "https://ik.imagekit.io/vivilastermas/alojamientos/hosteria-el-durazno/habitacion_vista_360.webp",
      "seoContent",
    )}&updatedAt=1782073656769`,
    rating: 5,
    stay: "Hostería El Durazno",
    instagramUrl:
      "https://www.instagram.com/reel/DV10WRSkUNm/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: 4,
    name: "Giuliana Blanco",
    image: withImageKitTransform(
      "https://ik.imagekit.io/vivilastermas/alojamientos/los-arboles/los-arboles001.webp",
      "seoContent",
    ),
    rating: 5,
    stay: "Cabañas Los Árboles",
    instagramUrl:
      "https://www.instagram.com/reel/DXCXhqEE6Pe/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
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
              <Image
                src={item.image}
                alt={`${copy.socialProof.title} — ${item.name}`}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
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
                  <a
                    href={item.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Ver en Instagram — ${item.name}`}
                  >
                    <Instagram className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
                  </a>
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
