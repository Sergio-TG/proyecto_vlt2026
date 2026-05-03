"use client"

import { Wifi, PawPrint, Filter, X, Waves, CheckCircle2, Coffee, Utensils, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getAlojamientosFiltered, AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import React, { Suspense, useState, useMemo, useEffect, useRef } from "react"
import { AccommodationCard } from "@/components/accommodations/AccommodationCard"
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { SocialProof } from "@/components/home/SocialProof"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { ContactMapSection } from "@/components/contact/ContactMapSection"
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

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

const SEARCH_MAPPING: Record<string, string[]> = {
  "bienestar-y-relax": ["masaje", "terma", "relax", "spa", "paz", "energia", "desconexion"],
  "aventura-y-exploracion": ["senderismo", "trekking", "aventura", "guia", "recorrido", "aire libre"],
  "escenarios-naturales": [
    "vista",
    "panoramica",
    "atardecer",
    "aire puro",
    "montana",
    "cerro",
    "sierra",
    "sierras",
    "naturaleza",
    "paisaje",
    "entorno",
    "bosque",
    "valle",
  ],
  desayuno: ["desayuno", "comida", "menu", "buffet"],
  cochera: ["cochera", "estacionamiento", "parking", "garage", "auto"],
  "parrilla-quincho": ["parrilla", "asador", "quincho", "barbacoa", "asado"],
  "pet-friendly": ["mascota", "pet", "perro", "gato", "animal"],
  "wi-fi": ["wifi", "wi-fi", "wifi gratis", "wi-fi gratis", "internet", "conexion", "fibra", "inalambrico"],
  "ropa-de-cama-y-toallas": ["ropa", "cama", "toallas", "sabanas", "blanco"],
  calefaccion: ["calefaccion", "estufa", "hogar", "lena", "calido", "climatizado"],
  "aire-acondicionado": ["aire", "split", "frio", "climatizado"],
  pileta: ["pileta", "piscina", "natacion", "solarium", "chapuzon"],
  "vista-a-la-montana": ["vista", "montana", "cerro", "sierra", "panoramica", "valle", "paisaje"],
  "cerca-de-rio-arroyo": ["rio", "arroyo", "orilla", "cauce", "agua"],
  accesibilidad: ["accesible", "rampa", "silla", "ruedas", "movilidad", "discapacidad"],
}

const EXPERIENCE_ID_TO_KEY: Record<string, string> = {
  relax: "bienestar-y-relax",
  adventure: "aventura-y-exploracion",
  nature: "escenarios-naturales",
}

const SERVICE_ALIAS_TO_KEY: Record<string, string> = {
  [normalizeText("Desayuno")]: "desayuno",
  [normalizeText("Cochera")]: "cochera",
  [normalizeText("Parrilla / Quincho")]: "parrilla-quincho",
  [normalizeText("Pet Friendly")]: "pet-friendly",
  [normalizeText("Wi-Fi")]: "wi-fi",
  [normalizeText("Ropa de Cama y Toallas")]: "ropa-de-cama-y-toallas",
  [normalizeText("Estufa a leña")]: "calefaccion",
  [normalizeText("Calefacción")]: "calefaccion",
  [normalizeText("Aire Acondicionado")]: "aire-acondicionado",
  [normalizeText("Pileta")]: "pileta",
  [normalizeText("Vista a la Montaña")]: "vista-a-la-montana",
  [normalizeText("Cerca de Río/Arroyo")]: "cerca-de-rio-arroyo",
  [normalizeText("Accesibilidad")]: "accesibilidad",
}

function toConceptKey(raw: string) {
  const trimmed = String(raw || "").trim()
  if (!trimmed) return null
  if (SEARCH_MAPPING[trimmed]) return trimmed
  const normalized = normalizeText(trimmed)
  const alias = SERVICE_ALIAS_TO_KEY[normalized]
  if (alias) return alias
  return null
}

function matchesConcept(corpus: string, conceptKey: string) {
  const keywords = SEARCH_MAPPING[conceptKey]
  if (!keywords || keywords.length === 0) return true
  return keywords.some((kw) => corpus.includes(normalizeText(kw)))
}

const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const revealVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
}

const toImageKitUrl = (relativePath: string) => {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "")
  const rel = relativePath.trim().replace(/^\/+/, "")
  return `${base}/${rel}`
}

const heroAlojamientosImage = toImageKitUrl("entorno/bg-paginas/hero-alojamientos.webp")
const MapAlojamiento = dynamic(() => import("@/components/maps/MapAlojamiento"), {
  ssr: false,
})

function AlojamientosPageInner() {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const [accommodations, setAccommodations] = useState<AlojamientoAprobado[]>([])
  const [loading, setLoading] = useState(true)
  const [portadaBySlug, setPortadaBySlug] = useState<Record<string, string | null>>({})
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
  const [selectedRequiredServicios, setSelectedRequiredServicios] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const serviciosParam = new URLSearchParams(window.location.search).get("servicios")
    if (!serviciosParam) return []
    return serviciosParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  })
  const [selectedExperience, setSelectedExperience] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return new URLSearchParams(window.location.search).get("experience") || ""
  })
  const [showShareToast, setShowShareToast] = useState(false)

  useEffect(() => {
    const nextFeaturesParam = searchParams.get("features") || ""
    const nextFeatures = nextFeaturesParam
      ? nextFeaturesParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const nextServiciosParam = searchParams.get("servicios") || ""
    const nextServicios = nextServiciosParam
      ? nextServiciosParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const nextExperience = searchParams.get("experience") || ""

    const syncFromUrl = () => {
      setSelectedFeatures((prev) => (prev.join("|") === nextFeatures.join("|") ? prev : nextFeatures))
      setSelectedRequiredServicios((prev) => (prev.join("|") === nextServicios.join("|") ? prev : nextServicios))
      setSelectedExperience((prev) => (prev === nextExperience ? prev : nextExperience))
    }

    if (typeof queueMicrotask === "function") {
      queueMicrotask(syncFromUrl)
    } else {
      Promise.resolve().then(syncFromUrl)
    }
  }, [searchParams])

  const buildSupabaseFilters = React.useCallback(() => {
    const requiredServicios: string[] = []
    let requirePet = false

    for (const feat of selectedFeatures) {
      if (feat === "wifi") requiredServicios.push("Wi-Fi")
      if (feat === "pool") requiredServicios.push("Pileta")
      if (feat === "breakfast") requiredServicios.push("Desayuno")
      if (feat === "bbq") requiredServicios.push("Parrilla / Quincho")
      if (feat === "heating") requiredServicios.push("Calefacción")
      if (feat === "parking") requiredServicios.push("Cochera")
      if (feat === "pet") requirePet = true
    }

    if (selectedRequiredServicios.some((s) => normalizeServiceForSearch(s).includes("petfriendly"))) {
      requirePet = true
    }

    return {
      requiredServicios: Array.from(new Set(requiredServicios)),
      requirePet,
      localidades: selectedLocation,
    }
  }, [selectedFeatures, selectedLocation, selectedRequiredServicios])

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

  useEffect(() => {
    let ignore = false
    async function loadPortadas() {
      const items = accommodations
        .map((a) => ({
          key: a.slug ? String(a.slug).trim() : slugify(a.nombre),
          slug: a.slug ? String(a.slug).trim() : slugify(a.nombre),
          nombre: String(a.nombre || "").trim(),
        }))
        .filter((row) => row.key && row.slug)
      if (items.length === 0) return
      const res = await fetch("/api/portadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
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

      const corpus = normalizeText(
        `${String(acc.nombre || "")} ${String(acc.descripcion || "")} ${(Array.isArray(acc.servicios) ? acc.servicios : []).join(" ")}`
      )

      const requiredConceptKeys = Array.from(
        new Set([
          ...selectedRequiredServicios.map(toConceptKey).filter((v): v is string => Boolean(v)),
          ...selectedFeatures
            .map((feat): string | null => {
              if (feat === "wifi") return "wi-fi"
              if (feat === "pet") return "pet-friendly"
              if (feat === "pool") return "pileta"
              if (feat === "parking") return "cochera"
              if (feat === "bbq") return "parrilla-quincho"
              if (feat === "breakfast") return "desayuno"
              if (feat === "heating") return "calefaccion"
              return null
            })
            .filter((v): v is string => Boolean(v)),
        ])
      )

      const serviciosWizardMatch =
        requiredConceptKeys.length === 0 || requiredConceptKeys.every((key) => matchesConcept(corpus, key))

      const experienceKey = EXPERIENCE_ID_TO_KEY[String(selectedExperience || "").trim()] ?? String(selectedExperience || "").trim()
      const experienceMatch = !selectedExperience || matchesConcept(corpus, experienceKey)

      return locationMatch && serviciosWizardMatch && experienceMatch
    })
  }, [accommodations, selectedFeatures, selectedLocation, selectedRequiredServicios, selectedExperience])

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
    setSelectedRequiredServicios([])
    setSelectedExperience("")
  }


  const renderFilterContent = (isDesktop = false) => (
    <div className={`space-y-8 ${isDesktop ? "" : "pb-20"}`}>
      {/* Localidad */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold tracking-tight">Localidad</h4>
        <div className="grid grid-cols-1 gap-3">
          {locations.map((loc) => {
            const id = `${isDesktop ? "desktop" : "mobile"}-loc-${loc}`
            return (
              <label
                key={loc}
                htmlFor={id}
                onClick={(e) => {
                  e.preventDefault()
                  toggleLocation(loc)
                }}
                className="flex items-center gap-2 group cursor-pointer rounded-lg px-2 py-2 -mx-2 hover:bg-slate-50"
              >
                <Checkbox
                  id={id}
                  checked={selectedLocation.includes(loc)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded-md border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                />
                <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">{loc}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold tracking-tight">Servicios</h4>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "wifi", label: "Wi-Fi Gratis", icon: Wifi },
            { id: "pet", label: "Pet Friendly", icon: PawPrint },
            { id: "pool", label: "Pileta", icon: Waves },
            { id: "parking", label: "Cochera", icon: Car },
            { id: "bbq", label: "Parrilla / Quincho", icon: Utensils },
            { id: "breakfast", label: "Desayuno", icon: Coffee },
          ].map((feat) => {
            const id = `${isDesktop ? "desktop" : "mobile"}-feat-${feat.id}`
            return (
              <label
                key={feat.id}
                htmlFor={id}
                onClick={(e) => {
                  e.preventDefault()
                  toggleFeature(feat.id)
                }}
                className="flex items-center gap-2 group cursor-pointer rounded-lg px-2 py-2 -mx-2 hover:bg-slate-50"
              >
                <Checkbox
                  id={id}
                  checked={selectedFeatures.includes(feat.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded-md border-2 border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                />
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2 group-hover:text-primary transition-colors">
                  <feat.icon className="w-4 h-4 opacity-60" />
                  {feat.label}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src={heroAlojamientosImage}
            alt="Alojamientos en El Durazno"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-bold mb-4 drop-shadow-2xl tracking-tighter"
          >
            Alojamientos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            Encontrá tu lugar ideal en las sierras
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
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
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                exit="exit"
                transition={{
                  duration: 0.7,
                  delay: (index % 6) * 0.05,
                  ease: premiumEase,
                }}
                className="flex"
              >
                <AccommodationCard
                  variant="listing"
                  item={item}
                  portadaFile={portadaBySlug[item.slug || slugify(item.nombre)]}
                  onShare={handleShare}
                />
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

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pb-24 space-y-3"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Mapa de alojamientos</h2>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              {filteredAccommodations.length} resultados
            </p>
          </div>
          <MapAlojamiento accommodations={filteredAccommodations} portadaBySlug={portadaBySlug} />
        </motion.div>
      </div>

      <SocialProof />

      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <NewsletterSignup sourcePrefix="alojamientos" />
          </div>
        </div>
      </section>

      <ContactMapSection />

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

export default function AlojamientosPage() {
  return (
    <Suspense fallback={null}>
      <AlojamientosPageInner />
    </Suspense>
  )
}
