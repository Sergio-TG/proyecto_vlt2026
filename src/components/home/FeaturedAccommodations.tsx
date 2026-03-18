"use client"

import Link from "next/link"
import { MapPin, Star, Users, Wifi, PawPrint, ArrowRight, Gem, Leaf } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { accommodations } from "@/data/accommodations"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function FeaturedAccommodations() {
  const sectionRef = useRef<HTMLDivElement>(null)
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
          className="flex flex-col md:flex-row justify-between items-center mb-32 gap-8"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight text-balance">
              Alojamientos <br/><span className="text-primary">Recomendados</span>
            </h2>
            <p className="text-slate-500 text-xl md:text-2xl font-light max-w-2xl leading-relaxed">
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
                <Button variant="ghost" className="flex gap-2 text-primary font-bold text-lg hover:bg-primary/5 px-6 h-12 rounded-full border border-transparent hover:border-primary/10 transition-all">
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
            
            <CarouselContent className="-ml-8">
              {accommodations.map((item, index) => (
                <CarouselItem key={item.id} className="pl-8 md:basis-1/2 lg:basis-1/3 flex">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.8 }}
                    className="flex w-full"
                  >
                    <Card className="group w-full overflow-hidden border-none shadow-[0_10px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-all duration-1000 flex flex-col rounded-[2.5rem] bg-white">
                      {/* Image Container with Parallax & Trevia Zoom */}
                      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                        <motion.div 
                          style={{ y: imageY }}
                          className="absolute inset-0 w-full h-[120%] -top-[10%]"
                        >
                          <motion.img 
                            src={item.image} 
                            alt={item.title} 
                            className="object-cover w-full h-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
                          {item.badges.map((badge, i) => (
                            <Badge key={i} variant="outline" className="bg-white/90 backdrop-blur-md border-slate-200 text-slate-700 shadow-sm px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                              {badge.includes("MÁS PEDIDO") && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                              {badge.includes("PREMIUM") && <Gem className="w-3 h-3 text-blue-500" />}
                              {badge.includes("ECO-FRIENDLY") && <Leaf className="w-3 h-3 text-green-500" />}
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Content Area with Fixed Structure */}
                      <div className="flex flex-col flex-grow">
                        <CardContent className="p-8 space-y-5 flex-grow z-10">
                          <div className="flex justify-between items-start gap-4 min-h-[70px]">
                            <div className="space-y-1.5">
                              <h3 className="font-bold text-2xl text-slate-900 leading-tight tracking-tight line-clamp-2">
                                {item.title}
                              </h3>
                              <div className="flex items-center text-slate-400 text-sm font-medium">
                                <MapPin className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl flex-shrink-0 border border-blue-100">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="text-base font-black text-primary">{item.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span>{item.features.guests} Pers.</span>
                            </div>
                            {item.features.wifi && (
                              <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-slate-400" />
                                <span>Wi-Fi</span>
                              </div>
                            )}
                            {item.features.pet && (
                              <div className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4 text-slate-400" />
                                <span>Pet Friendly</span>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="p-8 pt-0 flex items-center justify-between mt-auto z-10">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Desde</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900 tracking-tighter">{item.price}</span>
                              <span className="text-xs font-bold text-slate-400">/noche</span>
                            </div>
                          </div>
                          <Link href={`/alojamientos/${item.id}`}>
                              <Button size="lg" className="h-12 px-6 rounded-full font-bold text-base shadow-md bg-[#1a1f2c] hover:bg-primary text-white transition-all duration-300">
                                Ver Detalles
                              </Button>
                          </Link>
                        </CardFooter>
                      </div>
                    </Card>
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
    </section>
  )
}
