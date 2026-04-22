"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GaleriaAlojamiento } from "@/components/alojamientos/GaleriaAlojamiento"
import CustomImage from "@/components/common/CustomImage"
import { IK_TRANSFORMS } from "@/lib/imagekit.config"
import { slugify } from "@/lib/utils"
import { getIconByKey } from "@/lib/icons"
import {
  MapPin,
  Star,
  Users,
  BedDouble,
  Bath,
  Wifi,
  Wind,
  Waves,
  PawPrint,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ExternalLink,
  Clock,
  CalendarX2,
  LogOut,
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import * as React from "react"
import { getTaxonomiaServicios, type AlojamientoAprobado, type TaxonomiaServicio } from "@/lib/supabase-queries"

type AccommodationWithExtras = AlojamientoAprobado & {
  google_maps?: string | null
  ubicacion_google_maps?: string | null
  link_drive?: string | null
  direccion?: string | null
  distribucion_camas?: string | null
  check_in?: string | null
  check_out?: string | null
  cancelacion?: string | null
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

function isValidLatLng(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

function extractLatLngFromGoogleMapsUrl(raw: unknown): { lat: number; lng: number } | null {
  const url = typeof raw === "string" ? raw.trim() : ""
  if (!url) return null

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(atMatch[1])
    const lng = Number(atMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  if (qMatch) {
    const lat = Number(qMatch[1])
    const lng = Number(qMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  const embedMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (embedMatch) {
    const lat = Number(embedMatch[1])
    const lng = Number(embedMatch[2])
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }

  return null
}

function buildGoogleMapsEmbedSrc({
  lat,
  lng,
  rawUrl,
  address,
  localidad,
  nombre,
}: {
  lat: number | null
  lng: number | null
  rawUrl: string | null | undefined
  address: string | null | undefined
  localidad: string | null | undefined
  nombre: string | null | undefined
}) {
  if (isValidLatLng(lat, lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`
  }

  const url = String(rawUrl || "").trim()
  if (url.includes("google.com/maps/embed") || url.includes("output=embed")) {
    return url
  }

  const parsed = extractLatLngFromGoogleMapsUrl(url)
  if (parsed) {
    return `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}&output=embed`
  }

  const q = String(address || "").trim() || `${String(nombre || "").trim()} ${String(localidad || "").trim()}`.trim() || String(localidad || "").trim()
  if (!q) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
}

function normalizeServiceForSearch(service: string) {
  return service
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export function AccommodationDetailClient({
  accommodation,
  thumbUrls,
  fullUrls,
  portadaPath,
}: {
  accommodation: AccommodationWithExtras
  thumbUrls: string[]
  fullUrls: string[]
  portadaPath: string | null
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [showShareToast, setShowShareToast] = React.useState(false)
  const [taxonomia, setTaxonomia] = React.useState<TaxonomiaServicio[]>([])

  React.useEffect(() => {
    let mounted = true
    async function loadTaxonomy() {
      const taxonomy = await getTaxonomiaServicios()
      if (!mounted) return
      setTaxonomia(taxonomy)
    }
    loadTaxonomy()
    return () => {
      mounted = false
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5])

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: `Viví las Termas - ${accommodation.nombre}`,
      text: `Mirá este alojamiento increíble en las sierras: ${accommodation.nombre}`,
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
    } catch {
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "guests":
        return <Users className="w-5 h-5" />
      case "bedrooms":
        return <BedDouble className="w-5 h-5" />
      case "bathrooms":
        return <Bath className="w-5 h-5" />
      case "wifi":
        return <Wifi className="w-5 h-5" />
      case "ac":
        return <Wind className="w-5 h-5" />
      case "pool":
        return <Waves className="w-5 h-5" />
      case "pet":
        return <PawPrint className="w-5 h-5" />
      default:
        return <CheckCircle2 className="w-5 h-5" />
    }
  }

  const getFeatureLabel = (key: string, value: unknown) => {
    switch (key) {
      case "guests":
        return `${value} Personas`
      case "bedrooms":
        return `${value} Dormitorios`
      case "bathrooms":
        return `${value} Baños`
      case "wifi":
        return value ? "Wi-Fi Gratis" : "Sin Wi-Fi"
      case "ac":
        return value ? "Aire Acondicionado" : null
      case "pool":
        return value ? "Pileta" : null
      case "pet":
        return value ? "Pet Friendly" : "No Mascotas"
      default:
        return null
    }
  }

  const derivedFeatures = React.useMemo(() => {
    const s = accommodation.servicios?.map((serv) => normalizeServiceForSearch(serv)) || []

    let guests = accommodation.capacidad_total ? Number(accommodation.capacidad_total) : 0
    if (!Number.isFinite(guests)) guests = 0

    const capacityText = accommodation.servicios?.find((serv) => serv.includes("Capacidad:"))
    if (capacityText) {
      const match = capacityText.match(/\d+/)
      if (match) guests = parseInt(match[0])
    }

    return {
      guests,
      wifi: s.some((serv) => serv.includes("wifi")),
      pet: s.some((serv) => serv.includes("mascota") || serv.includes("pet") || serv.includes("acepta")),
      pool: s.some((serv) => serv.includes("piscina") || serv.includes("pileta")),
    }
  }, [accommodation])

  type ServicioDisplay = { key: string; nombre: string; icono_key: string }

  const serviciosFlat = React.useMemo<ServicioDisplay[]>(() => {
    const serviciosAlojamiento = Array.isArray(accommodation.servicios) ? accommodation.servicios : []
    if (serviciosAlojamiento.length === 0) return []
    if (taxonomia.length === 0) {
      return serviciosAlojamiento
        .filter((s) => !/^(tipo|capacidad)\s*:/i.test(String(s || "").trim()))
        .map((s) => String(s))
        .filter(Boolean)
        .map((nombre) => ({ key: `raw:${nombre}`, nombre, icono_key: "" }))
    }

    const matches = taxonomia.filter((t) => {
      const tn = normalizeServiceForSearch(t.nombre)
      return serviciosAlojamiento.some((s) => {
        const sn = normalizeServiceForSearch(s)
        return sn.includes(tn) || tn.includes(sn)
      })
    })

    const known = matches
      .slice()
      .sort((a, b) => {
        const aStar = a.es_filtro_principal ? 1 : 0
        const bStar = b.es_filtro_principal ? 1 : 0
        if (aStar !== bStar) return bStar - aStar
        return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      })
      .map((s) => ({ key: `tax:${s.id}`, nombre: s.nombre, icono_key: s.icono_key }))

    const unknown = serviciosAlojamiento
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .filter((s) => !/^(tipo|capacidad)\s*:/i.test(s))
      .filter((raw) => {
        const rn = normalizeServiceForSearch(raw)
        return !matches.some((t) => {
          const tn = normalizeServiceForSearch(t.nombre)
          return rn.includes(tn) || tn.includes(rn)
        })
      })

    const unknownUnique = Array.from(new Set(unknown)).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
    const unknownDisplay = unknownUnique.map((nombre) => ({ key: `raw:${nombre}`, nombre, icono_key: "" }))

    return [...known, ...unknownDisplay]
  }, [accommodation.servicios, taxonomia])

  const uniqueServices = React.useMemo(() => {
    return Array.from(new Map(serviciosFlat.map((s) => [s.key, s])).values())
  }, [serviciosFlat])

  const lat = toNum((accommodation as { latitud?: unknown }).latitud)
  const lng = toNum((accommodation as { longitud?: unknown }).longitud)
  const mapEmbedSrc = React.useMemo(
    () =>
      buildGoogleMapsEmbedSrc({
        lat,
        lng,
        rawUrl: accommodation.google_maps ?? accommodation.ubicacion_google_maps,
        address: accommodation.direccion,
        localidad: accommodation.localidad,
        nombre: accommodation.nombre,
      }),
    [lat, lng, accommodation.google_maps, accommodation.ubicacion_google_maps, accommodation.direccion, accommodation.localidad, accommodation.nombre]
  )

  const folderSlug = (accommodation.slug || slugify(accommodation.nombre || "")).trim()
  const heroPath = portadaPath ? `${portadaPath.split("?")[0]}?${IK_TRANSFORMS.heroPage}` : null

  return (
    <div className="min-h-screen bg-white pb-20 overflow-hidden">
      <section ref={containerRef} className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden flex items-end">
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          {heroPath ? (
            <CustomImage
              path={heroPath}
              folder="ALOJAMIENTOS"
              subfolder={folderSlug}
              alt={accommodation.nombre}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/60" />
          )}
        </motion.div>

        <div className="relative z-20 w-full p-8 pb-24 md:p-20 md:pb-32 text-white container mx-auto pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <Link
                href="/alojamientos"
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-all hover:-translate-x-1 pointer-events-auto"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium tracking-tight">Volver al catálogo</span>
              </Link>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-white/95 text-black hover:bg-white border-none text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-xl">
                  {accommodation.tipo_alojamiento}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none drop-shadow-2xl">
                {accommodation.nombre}
              </h1>
              <div className="flex flex-col gap-3 text-lg md:text-xl font-light">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      <span className="opacity-90">{accommodation.localidad}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">{accommodation.rating_google || "—"}</span>
                      <span className="text-base opacity-60">(Google Maps)</span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 pointer-events-auto"
                  >
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="bg-transparent border-white/20 hover:bg-primary hover:border-primary text-white rounded-full h-10 px-4 flex items-center gap-2 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="font-bold">Compartir</span>
                    </Button>
                  </motion.div>
                </div>

                {(String(accommodation.direccion || "").trim() ||
                  String(accommodation.google_maps || accommodation.ubicacion_google_maps || "").trim()) && (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60 pointer-events-auto">
                    {String(accommodation.direccion || "").trim() && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{String(accommodation.direccion || "").trim()}</span>
                      </div>
                    )}
                    {String(accommodation.google_maps || accommodation.ubicacion_google_maps || "").trim() && (
                      <a
                        href={String(accommodation.google_maps || accommodation.ubicacion_google_maps)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-bold hover:text-white transition-colors"
                      >
                        Ver en Google Maps
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        {thumbUrls.length > 0 && fullUrls.length > 0 && (
          <section className="mt-10 md:mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Galería</h2>
            <GaleriaAlojamiento thumbUrls={thumbUrls} fullUrls={fullUrls} nombreAlojamiento={accommodation.nombre} />
          </section>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardContent className="p-10 md:p-16">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {Object.entries(derivedFeatures).map(([key, value], idx) => {
                      const label = getFeatureLabel(key, value)
                      if (!label) return null
                      if (key === "guests" && value === 0) return null
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl text-center gap-3 hover:bg-white hover:shadow-xl transition-all duration-500 border border-slate-100 group"
                        >
                          <div className="text-primary transform group-hover:scale-110 transition-transform">
                            {getFeatureIcon(key)}
                          </div>
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight leading-none">
                            {label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="space-y-6 text-slate-600 mb-12">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sobre este alojamiento</h3>
                    <p className="text-lg leading-relaxed font-light">{accommodation.descripcion}</p>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Servicios Incluidos</h3>
                    {uniqueServices.length === 0 ? (
                      <div className="text-slate-500 text-sm font-medium">No hay servicios para mostrar.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                        {uniqueServices.map((servicio) => {
                          const IconComponent = getIconByKey(servicio.icono_key)
                          return (
                            <div key={servicio.key} className="flex items-center gap-2 text-slate-700 min-w-0">
                              <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{servicio.nombre}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-12 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Información de estadía</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                        <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Personas</div>
                          <div className="text-sm font-bold text-slate-800">
                            {derivedFeatures.guests || accommodation.capacidad_total || "—"}
                          </div>
                        </div>
                      </div>

                      {String(accommodation.distribucion_camas || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <BedDouble className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              Distribución de camas
                            </div>
                            <div className="text-sm font-bold text-slate-800 break-words">
                              {String(accommodation.distribucion_camas)}
                            </div>
                          </div>
                        </div>
                      )}

                      {String(accommodation.check_in || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Check-in</div>
                            <div className="text-sm font-bold text-slate-800">{String(accommodation.check_in)}</div>
                          </div>
                        </div>
                      )}

                      {String(accommodation.check_out || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <LogOut className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Check-out</div>
                            <div className="text-sm font-bold text-slate-800">{String(accommodation.check_out)}</div>
                          </div>
                        </div>
                      )}

                      {String(accommodation.cancelacion || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100 sm:col-span-2">
                          <CalendarX2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Cancelación</div>
                            <div className="text-sm font-bold text-slate-800 break-words">
                              {String(accommodation.cancelacion)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:sticky md:top-32"
            >
              <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 p-10 border-b border-slate-100">
                  <CardTitle className="flex justify-between items-end">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {accommodation.precio_base ? `$${accommodation.precio_base.toLocaleString("es-AR")}` : "Consultar"}
                    </span>
                    <span className="text-base text-slate-400 font-medium mb-1">/ noche</span>
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-slate-500 pt-2">
                    Estadía mínima de {accommodation.noches_minimas || 1} noches
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      className="w-full bg-[#1a1f2c] hover:bg-primary text-white shadow-2xl text-lg h-20 rounded-full font-bold"
                    >
                      <a
                        href={`https://wa.me/5493546525404?text=Hola, me interesa consultar disponibilidad para *${accommodation.nombre}*.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Consultar Disponibilidad
                      </a>
                    </Button>
                  </motion.div>
                  <p className="text-sm text-center text-slate-400 font-medium leading-relaxed">
                    Serás redirigido a WhatsApp para hablar directamente con nosotros y recibir asesoría personalizada.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {mapEmbedSrc && (
          <section className="mt-12 lg:mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ubicación</h2>
            <div className="h-[360px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                title={`Mapa - ${accommodation.nombre}`}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedSrc}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
