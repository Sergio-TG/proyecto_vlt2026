"use client"

import Link from "next/link"
import { MapPin, Star, Users, Wifi, PawPrint, Filter, X, Waves, Share2, CheckCircle2, Tv, Coffee, Utensils, Flame, Snowflake, ArrowRight, Gem, Leaf, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getAlojamientosFiltered, AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useMemo, useEffect } from "react"
import CustomImage from "@/components/common/CustomImage"
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

function normalizeServiceForSearch(service: string) {
  return service
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export default function AlojamientosPage() {
  const [accommodations, setAccommodations] = useState<AlojamientoAprobado[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const featuresParam = new URLSearchParams(window.location.search).get("features")
    if (!featuresParam) return []
    return featuresParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  })
  const [showShareToast, setShowShareToast] = useState(false)

  const buildSupabaseFilters = React.useCallback(() => {
    const requiredServicios: string[] = []
    let requirePet = false

    for (const feat of selectedFeatures) {
      if (feat === "wifi") requiredServicios.push("Wi-Fi")
      if (feat === "pool") requiredServicios.push("Pileta")
      if (feat === "breakfast") requiredServicios.push("Desayuno")
      if (feat === "bbq") requiredServicios.push("Parrilla / Quincho")
      if (feat === "heating") requiredServicios.push("Estufa a leña")
      if (feat === "parking") requiredServicios.push("Cochera")
      if (feat === "pet") requirePet = true
    }

    return {
      requiredServicios: Array.from(new Set(requiredServicios)),
      requirePet,
      localidades: selectedLocation,
    }
  }, [selectedFeatures, selectedLocation])

  useEffect(() => {
    let ignore = false
    async function loadData() {
      setLoading(true)
      const filters = buildSupabaseFilters()
      const data = await getAlojamientosFiltered({
        requiredServicios: filters.requiredServicios,
        localidades: filters.localidades,
        requirePet: filters.requirePet,
        allowLegacyParking: true,
      })
      if (ignore) return
      setAccommodations(data)
      setLoading(false)
    }
    loadData()
    return () => {
      ignore = true
    }
  }, [buildSupabaseFilters])

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

  // Obtener localidades únicas de los datos
  const locations = useMemo(() => {
    const locs = accommodations.map(acc => acc.localidad)
    return Array.from(new Set(locs))
  }, [accommodations])

  const filteredAccommodations = useMemo(() => {
    return accommodations.filter((acc) => {
      const locationMatch =
        selectedLocation.length === 0 ||
        selectedLocation.some((loc) => acc.localidad.includes(loc))

      const featuresMatch =
        selectedFeatures.length === 0 ||
        selectedFeatures.every((feat) => {
          if (!acc.servicios) return false
          const s = acc.servicios.map(normalizeServiceForSearch)
          if (feat === "wifi") return s.some((serv) => serv.includes("wifi"))
          if (feat === "pet") return (acc.mascotas === "Sí") || s.some((serv) => serv.includes("pet") || serv.includes("mascota"))
          if (feat === "pool") return s.some((serv) => serv.includes("piscina") || serv.includes("pileta"))
          if (feat === "parking") return s.some((serv) => serv.includes("cochera"))
          if (feat === "bbq") return s.some((serv) => serv.includes("parrilla") || serv.includes("asador") || serv.includes("quincho"))
          if (feat === "breakfast") return s.some((serv) => serv.includes("desayuno"))
          if (feat === "heating") return s.some((serv) => serv.includes("estufa") || serv.includes("calefaccion"))
          return true
        })

      return locationMatch && featuresMatch
    })
  }, [accommodations, selectedFeatures, selectedLocation])

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

  const getServiceIcon = (service: string) => {
    const s = normalizeServiceForSearch(service)
    if (s.includes("wifi")) return <Wifi className="w-3.5 h-3.5" />;
    if (s.includes("piscina") || s.includes("pileta")) return <Waves className="w-3.5 h-3.5" />;
    if (s.includes("cochera")) return <Car className="w-3.5 h-3.5" />;
    if (s.includes("tv") || s.includes("cable")) return <Tv className="w-3.5 h-3.5" />;
    if (s.includes("desayuno")) return <Coffee className="w-3.5 h-3.5" />;
    if (s.includes("cocina") || s.includes("vajilla")) return <Utensils className="w-3.5 h-3.5" />;
    if (s.includes("estufa") || s.includes("calefaccion")) return <Flame className="w-3.5 h-3.5" />;
    if (s.includes("aire") || s.includes("ac")) return <Snowflake className="w-3.5 h-3.5" />;
    if (s.includes("parrilla") || s.includes("asador") || s.includes("quincho")) return <Utensils className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  const renderFilterContent = (isDesktop = false) => (
    <div className={`space-y-8 ${isDesktop ? "" : "pb-20"}`}>
      {/* Localidad */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold tracking-tight">Localidad</h4>
        <div className="grid grid-cols-1 gap-3">
          {locations.map(loc => (
            <div key={loc} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleLocation(loc)}>
              <Checkbox 
                id={`${isDesktop ? 'desktop' : 'mobile'}-loc-${loc}`} 
                checked={selectedLocation.includes(loc)}
                className="w-5 h-5 rounded-md border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
              />
              <Label htmlFor={`${isDesktop ? 'desktop' : 'mobile'}-loc-${loc}`} className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors cursor-pointer">{loc}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold tracking-tight">Servicios</h4>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "wifi", label: "Wi-Fi Gratis", icon: Wifi },
            { id: "pet", label: "Pet Friendly", icon: PawPrint },
            { id: "pool", label: "Piscina", icon: Waves },
            { id: "parking", label: "Cochera", icon: Car },
            { id: "bbq", label: "Parrilla / Quincho", icon: Utensils },
            { id: "breakfast", label: "Desayuno", icon: Coffee },
          ].map(feat => (
            <div key={feat.id} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleFeature(feat.id)}>
              <Checkbox 
                id={`${isDesktop ? 'desktop' : 'mobile'}-feat-${feat.id}`} 
                checked={selectedFeatures.includes(feat.id)}
                className="w-5 h-5 rounded-md border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
              />
              <Label htmlFor={`${isDesktop ? 'desktop' : 'mobile'}-feat-${feat.id}`} className="text-sm font-medium text-slate-600 flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer">
                <feat.icon className="w-4 h-4 opacity-60" />
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
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8"
        >
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Alojamientos <br/><span className="text-primary">Verificados</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl font-light leading-relaxed text-balance">
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
                    {renderFilterContent(false)}
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
                {renderFilterContent(true)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAccommodations.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.4,
                  delay: (index % 6) * 0.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="flex"
              >
                <Card className="group w-full overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col rounded-[2rem] bg-white relative">
                  {/* Link envolvente para toda la card (excepto botones de acción) */}
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
                      <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm border-none shadow-sm px-2.5 py-1 rounded-full font-black text-[8px] uppercase tracking-wider flex items-center gap-1">
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
                      className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md border border-white/20 text-slate-700 hover:bg-primary hover:text-white transition-all duration-300"
                      title="Compartir alojamiento"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  {/* Content Area - New Design from Image */}
                  <div className="flex flex-col flex-grow p-5 pt-4 space-y-3 relative z-20">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 flex-grow">
                        <h3 className="font-black text-[15px] text-slate-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.nombre}
                        </h3>
                        <div className="flex items-center text-[#38bdf8] text-[10px] font-bold">
                          <MapPin className="w-3 h-3 mr-1 fill-[#7dd3fc]/20 flex-shrink-0" />
                          <span className="truncate uppercase tracking-tight">{item.localidad}</span>
                        </div>
                      </div>
                      
                      {/* Rating Badge next to Title */}
                      <div className="flex items-center gap-1 bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm flex-shrink-0">
                        <Star className="w-3 h-3 fill-[#2563eb]" />
                        {item.rating_google || "—"}
                      </div>
                    </div>

                    {/* Amenities List - Clean Horizontal Style */}
                    {item.servicios && item.servicios.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        {/* Capacidad / Personas */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Users className="w-3 h-3" />
                          <span className="text-[10px] font-bold">
                            {item.capacidad_total || item.servicios.find(s => s.includes('Capacidad'))?.match(/\d+/)?.[0] || "4"} Pers.
                          </span>
                        </div>
                        {/* WiFi */}
                        {item.servicios.some(s => normalizeServiceForSearch(s).includes('wifi')) && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Wifi className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Wi‑Fi</span>
                          </div>
                        )}
                        {/* Mascotas */}
                        {item.servicios.some(s => normalizeServiceForSearch(s).includes('mascota') || normalizeServiceForSearch(s).includes('pet')) && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <PawPrint className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Pet Friendly</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between mt-auto border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Desde</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[20px] font-black text-slate-900 leading-none">
                            {item.precio_base ? `$${item.precio_base.toLocaleString('es-AR')}` : "Consultar"}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold ml-0.5">/noche</span>
                        </div>
                      </div>
                      <div className="relative z-30">
                        <Link href={`/alojamientos/${item.slug}`}>
                          <Button className="h-9 px-6 rounded-full font-black text-[11px] bg-[#1a1f2c] hover:bg-primary text-white shadow-lg shadow-slate-200 transition-all duration-300">
                            Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
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
