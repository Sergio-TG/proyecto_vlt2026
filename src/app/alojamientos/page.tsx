"use client"

import Link from "next/link"
import { MapPin, Star, Users, Wifi, PawPrint, Filter, X, Waves, Share2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { accommodations } from "@/data/accommodations"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function AlojamientosPage() {
  const [selectedLocation, setSelectedLocation] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [showShareToast, setShowShareToast] = useState(false)

  // Función para compartir alojamiento
  const handleShare = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const url = `${window.location.origin}/alojamientos/${id}`
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

  // Obtener localidades únicas de los datos
  const locations = useMemo(() => {
    const locs = accommodations.map(acc => acc.location.split(" - ")[0])
    return Array.from(new Set(locs))
  }, [])

  // Filtrar alojamientos
  const filteredAccommodations = useMemo(() => {
    return accommodations.filter(acc => {
      const locationMatch = selectedLocation.length === 0 || 
        selectedLocation.some(loc => acc.location.includes(loc))
      
      const featuresMatch = selectedFeatures.length === 0 ||
        selectedFeatures.every(feat => {
          if (feat === "wifi") return acc.features.wifi
          if (feat === "pet") return acc.features.pet
          if (feat === "pool") return acc.features.pool
          return true
        })

      return locationMatch && featuresMatch
    })
  }, [selectedLocation, selectedFeatures])

  const toggleLocation = (loc: string) => {
    setSelectedLocation(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    )
  }

  const clearFilters = () => {
    setSelectedLocation([])
    setSelectedFeatures([])
  }

  const FilterContent = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div className={`space-y-10 ${isDesktop ? "" : "pb-20"}`}>
      {/* Localidad */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold tracking-tight">Localidad</h4>
        <div className="grid grid-cols-1 gap-4">
          {locations.map(loc => (
            <div key={loc} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleLocation(loc)}>
              <Checkbox 
                id={`${isDesktop ? 'desktop' : 'mobile'}-loc-${loc}`} 
                checked={selectedLocation.includes(loc)}
                className="w-6 h-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
              />
              <Label htmlFor={`${isDesktop ? 'desktop' : 'mobile'}-loc-${loc}`} className="text-lg font-medium text-slate-600 group-hover:text-primary transition-colors cursor-pointer">{loc}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold tracking-tight">Servicios</h4>
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: "wifi", label: "Wi-Fi Gratis", icon: Wifi },
            { id: "pet", label: "Pet Friendly", icon: PawPrint },
            { id: "pool", label: "Piscina", icon: Waves },
          ].map(feat => (
            <div key={feat.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleFeature(feat.id)}>
              <Checkbox 
                id={`${isDesktop ? 'desktop' : 'mobile'}-feat-${feat.id}`} 
                checked={selectedFeatures.includes(feat.id)}
                className="w-6 h-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
              />
              <Label htmlFor={`${isDesktop ? 'desktop' : 'mobile'}-feat-${feat.id}`} className="text-lg font-medium text-slate-600 flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer">
                <feat.icon className="w-5 h-5 opacity-60" />
                {feat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-32">
        {/* Header with Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
              Alojamientos <br/><span className="text-primary">Verificados</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-light leading-relaxed text-balance">
              Encontrá tu lugar ideal en las sierras. Todos inspeccionados personalmente para garantizar tu bienestar.
            </p>
          </div>

          <div className="flex gap-4">
            {(selectedLocation.length > 0 || selectedFeatures.length > 0) && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-slate-400 hover:text-red-500 font-bold"
              >
                Limpiar Filtros
              </Button>
            )}
            
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="gap-3 h-16 px-10 rounded-full border-2 font-black text-xl hover:bg-slate-50 transition-all shadow-2xl shadow-slate-200/50">
                        <Filter className="w-6 h-6 text-primary" />
                        Filtrar
                        {(selectedLocation.length + selectedFeatures.length) > 0 && (
                          <Badge className="ml-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center p-0">
                            {selectedLocation.length + selectedFeatures.length}
                          </Badge>
                        )}
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md rounded-r-[3rem] border-none shadow-2xl p-0 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-10 pb-0 custom-scrollbar">
                    <SheetHeader className="mb-10">
                      <SheetTitle className="text-3xl font-black tracking-tight">Filtros de Búsqueda</SheetTitle>
                      <SheetDescription className="text-lg">
                        Ajustá los resultados según tus preferencias.
                      </SheetDescription>
                    </SheetHeader>
                    <FilterContent />
                  </div>

                  <SheetFooter className="p-10 pt-6 mt-auto border-t border-slate-100 bg-white/80 backdrop-blur-md z-20">
                    <SheetClose asChild>
                      <Button className="w-full h-16 rounded-full font-black text-xl shadow-2xl">
                        Ver {filteredAccommodations.length} Resultados
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-32 space-y-10 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Filtros</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">Refiná tu búsqueda</p>
                <FilterContent isDesktop />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="mb-10 flex items-center gap-4">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Mostrando {filteredAccommodations.length} de {accommodations.length} alojamientos
              </p>
              <div className="h-px flex-grow bg-slate-100" />
            </div>

            {/* Grid with Staggered Reveal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAccommodations.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  delay: (index % 3) * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex"
              >
                <Card className="group w-full overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col rounded-[1.5rem] bg-white">
                  {/* Image Container with Trevia-style Zoom */}
                  <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                      src={item.image} 
                      alt={item.title} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {item.badges.map((badge, i) => (
                        <Badge key={i} className="bg-white/95 text-slate-800 backdrop-blur-md border-none shadow-sm px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Botón Compartir */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleShare(e, item.id, item.title)}
                      className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-white/20 text-slate-700 hover:bg-primary hover:text-white transition-all duration-300"
                      title="Compartir alojamiento"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-col flex-grow">
                    <CardContent className="p-5 space-y-3 flex-grow z-10 bg-white">
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-1 text-slate-900">
                            {item.title}
                          </h3>
                          <div className="flex items-center text-slate-400 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-primary/60 flex-shrink-0" />
                            <span className="truncate">{item.location.split(" - ")[0]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg flex-shrink-0 border border-primary/10">
                          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                          <span className="text-xs font-black text-primary">{item.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.features.guests} p.</span>
                        </div>
                        {item.features.wifi && (
                          <div className="flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-slate-400" />
                            <span>Wi-Fi</span>
                          </div>
                        )}
                        {item.features.pet && (
                          <div className="flex items-center gap-1.5">
                            <PawPrint className="w-3.5 h-3.5 text-slate-400" />
                            <span>Pet</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto z-10 bg-white">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Noche</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black text-slate-900 tracking-tight">{item.price}</span>
                        </div>
                      </div>
                      <Link href={`/alojamientos/${item.id}`}>
                        <Button size="sm" className="h-10 px-4 rounded-full font-bold text-xs shadow-sm bg-[#1a1f2c] hover:bg-primary text-white transition-all duration-300">
                          Detalles
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

            {filteredAccommodations.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="py-40 text-center space-y-6"
              >
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">No hay resultados</h3>
                <p className="text-xl text-slate-500 font-light">Probá ajustando los filtros para encontrar lo que buscás.</p>
                <Button onClick={clearFilters} className="rounded-full px-8 h-14 font-bold">Ver todos los alojamientos</Button>
              </motion.div>
            )}
          </div>
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
    </div>
  )
}

