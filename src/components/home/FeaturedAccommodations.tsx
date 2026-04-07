"use client"

import Link from "next/link"
import { MapPin, Star, Users, Wifi, PawPrint, ArrowRight, Gem, Leaf, Share2, CheckCircle2 } from "lucide-react"
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
import CustomImage from "@/components/common/CustomImage"

function normalizeServiceForSearch(service: string) {
  return service
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export function FeaturedAccommodations() {
  const [accommodations, setAccommodations] = useState<AlojamientoAprobado[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareToast, setShowShareToast] = useState(false)
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
                    <div className="group w-full overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-500 flex flex-col rounded-[2rem] bg-white relative">
                      {/* Link envolvente para toda la card */}
                      <Link href={`/alojamientos/${item.slug}`} className="absolute inset-0 z-10">
                        <span className="sr-only">Ver detalles de {item.nombre}</span>
                      </Link>

                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0 p-2 pb-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                          className="w-full h-full overflow-hidden rounded-[1.8rem]"
                        >
                          <CustomImage 
                            path="portada.webp"
                            folder="ALOJAMIENTOS"
                            subfolder={item.slug || slugify(item.nombre)}
                            alt={item.nombre}
                            alternatePaths={["portada.jpg"]}
                            fallbackCandidates={[{ folder: "ENTORNO", path: "placeholder-vlt.webp" }]}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        
                        {/* Dynamic Badge like the image */}
                        <div className="absolute top-4 left-4 z-20">
                          <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm border-none shadow-sm px-2 py-0.5 rounded-full font-black text-[7px] uppercase tracking-wider flex items-center gap-1">
                            {item.rating_google && item.rating_google >= 4.8 ? (
                              <><Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> MÁS PEDIDO</>
                            ) : item.precio_base && item.precio_base > 100000 ? (
                              <><Gem className="w-2.5 h-2.5 text-blue-500" /> PREMIUM</>
                            ) : (
                              <><Leaf className="w-2.5 h-2.5 text-green-500" /> ECO-FRIENDLY</>
                            )}
                          </Badge>
                        </div>

                        {/* Botón Compartir */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShare(e, item.slug, item.nombre)}
                          className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-md border border-white/20 text-slate-700 hover:bg-primary hover:text-white transition-all duration-300"
                          title="Compartir alojamiento"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                      {/* Content Area - New Design from Image */}
                      <div className="flex flex-col flex-grow p-5 pt-4 space-y-3 relative z-20">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5 flex-grow">
                            <h3 className="font-black text-[15px] text-slate-900 leading-tight tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                              {item.nombre}
                            </h3>
                            <div className="flex items-center text-[#38bdf8] text-[10px] font-bold">
                              <MapPin className="w-3 h-3 mr-1 fill-[#38bdf8]/20 flex-shrink-0" />
                              <span className="truncate uppercase tracking-tight">{item.localidad}</span>
                            </div>
                          </div>
                          
                          {/* Rating Badge next to Title */}
                          <div className="flex items-center gap-1 bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm flex-shrink-0">
                            <Star className="w-3 h-3 fill-[#2563eb]" />
                            {item.rating_google || "—"}
                          </div>
                        </div>

                        {/* Amenities List - Simple Icons */}
                        {item.servicios && item.servicios.length > 0 && (
                          <div className="flex items-center gap-3 pt-0.5">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-3 h-3" />
                              <span className="text-[10px] font-bold">
                                {item.capacidad_total || item.servicios.find(s => s.includes('Capacidad'))?.match(/\d+/)?.[0] || "4"} Pers.
                              </span>
                            </div>
                            {item.servicios.some(s => normalizeServiceForSearch(s).includes('wifi')) && (
                              <Wifi className="w-3 h-3 text-slate-400" />
                            )}
                            {item.servicios.some(s => normalizeServiceForSearch(s).includes('mascota') || normalizeServiceForSearch(s).includes('pet')) && (
                              <PawPrint className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        )}

                        <div className="pt-4 flex items-center justify-between mt-auto border-t border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Desde</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-[18px] font-black text-slate-900 leading-none">
                                {item.precio_base ? `$${item.precio_base.toLocaleString('es-AR')}` : "Consultar"}
                              </span>
                              <span className="text-[8px] text-slate-400 font-bold ml-0.5">/noche</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-wider">
                            Detalles
                            <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
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
