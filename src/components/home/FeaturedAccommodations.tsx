"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAlojamientos, AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { AccommodationCard } from "@/components/accommodations/AccommodationCard"

export function FeaturedAccommodations() {
  const [accommodations, setAccommodations] = useState<AlojamientoAprobado[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareToast, setShowShareToast] = useState(false)
  const [portadaBySlug, setPortadaBySlug] = useState<Record<string, string | null>>({})
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      const data = await getAlojamientos()
      // Solo mostrar los primeros 10 o los que tengan mejor rating
      setAccommodations(data.slice(0, 10))
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let ignore = false
    async function loadPortadas() {
      const slugs = accommodations
        .map((a) => (a.slug ? String(a.slug).trim() : slugify(a.nombre)))
        .filter(Boolean)
      if (slugs.length === 0) return
      const res = await fetch("/api/portadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      }).catch(() => null)
      const json = (await res?.json().catch(() => null)) as unknown
      const map = (json as { portadas?: Record<string, string | null> })?.portadas ?? {}
      if (ignore) return
      setPortadaBySlug(map)
    }
    loadPortadas()
    return () => {
      ignore = true
    }
  }, [accommodations])

  // Función para compartir alojamiento
  const handleShare = async (e: React.MouseEvent, slug: string, title: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const url = `${window.location.origin}/alojamientos/${slug}`
    const shareData = {
      title: `Viví las Termas - ${title}`,
      text: `Mirá este alojamiento increíble en las sierras: ${title}`,
      url: url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (err) {
      console.error("Error al compartir:", err)
    }
  }

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Efecto Parallax para las imágenes de las tarjetas
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"])

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-center mb-16 md:mb-24 gap-8"
        >
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight text-balance">
              Alojamientos <br/><span className="text-primary">Recomendados</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              Selección exclusiva verificada personalmente para garantizar tu descanso en las sierras.
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-10">
            <Link href="/alojamientos">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Button variant="ghost" className="flex gap-2 text-primary font-bold text-base hover:bg-primary/5 px-6 h-12 rounded-full border border-transparent hover:border-primary/10 transition-all">
                    Ver Catálogo Completo <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            {/* Controles del Carrusel movidos aquí dentro para recuperar el contexto */}
            <div className="hidden md:flex gap-4 absolute -top-32 right-0 z-20">
              <CarouselPrevious className="static translate-y-0 h-14 w-14 border-slate-200 bg-white shadow-2xl hover:bg-primary hover:text-white transition-all duration-500 hover:scale-110" />
              <CarouselNext className="static translate-y-0 h-14 w-14 border-slate-200 bg-white shadow-2xl hover:bg-primary hover:text-white transition-all duration-500 hover:scale-110" />
            </div>
            
            <CarouselContent className="-ml-2 py-10 -my-10">
              {accommodations.map((item, index) => (
                <CarouselItem key={item.id} className="pl-2 basis-[92%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5 flex">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="flex w-full p-0.5"
                  >
                    <div className="w-full">
                      <AccommodationCard
                        variant="home"
                        item={item}
                        portadaFile={portadaBySlug[item.slug || slugify(item.nombre)]}
                        onShare={handleShare}
                      />
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Controles eliminados de aquí abajo */}
          </Carousel>
        </motion.div>

        <div className="mt-16 text-center md:hidden">
            <Link href="/alojamientos">
                <Button variant="outline" className="w-full h-16 rounded-full font-black text-xl border-2 border-primary text-primary hover:bg-primary/5 shadow-xl">
                    Ver todo el catálogo
                </Button>
            </Link>
        </div>

      </div>

      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold">¡Enlace copiado al portapapeles!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
