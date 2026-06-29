"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GaleriaAlojamiento } from "@/components/alojamientos/GaleriaAlojamiento"
import { getAccommodationGalleryVideo } from "@/lib/accommodation-gallery.config"
import CustomImage from "@/components/common/CustomImage"
import { IK_TRANSFORMS, appendImageKitCacheVersion, imageKitCacheVersion } from "@/lib/imagekit.config"
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
import dynamic from "next/dynamic"
import { getTaxonomiaServicios, type AlojamientoAprobado, type TaxonomiaServicio } from "@/lib/supabase-queries"
import { supabase } from "@/lib/supabase"
import {
  buildGoogleMapsHref,
  getAccommodationMapPin,
  needsGoogleMapsRedirectResolve,
} from "@/lib/google-maps-embed"
import { AccommodationReviewsSection } from "@/components/accommodations/AccommodationReviewsSection"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import {
  resolveAccommodationDescription,
  translateAccommodationService,
  translateStayInfoValue,
  hasBedLayoutData,
  hasCancellationData,
} from "@/lib/accommodation-i18n"
import type { DistribucionCamaItem, CancelacionPolicy } from "@/lib/supabase-queries"
import type { ApprovedReview } from "@/lib/reviews"
import type { ReviewStats } from "@/lib/review-stats"

const AlojamientoDetailLocationMap = dynamic(
  () =>
    import("@/components/maps/AlojamientoDetailLocationMap").then((mod) => ({
      default: mod.AlojamientoDetailLocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center bg-slate-50 text-slate-500">
        <MapPin className="mr-2 h-5 w-5 animate-pulse" />
      </div>
    ),
  },
)

type AccommodationWithExtras = AlojamientoAprobado & {
  google_maps?: string | null
  ubicacion_google_maps?: string | null
  link_drive?: string | null
  direccion?: string | null
  distribucion_camas?: DistribucionCamaItem[] | null
  check_in?: string | null
  check_out?: string | null
  cancelacion?: CancelacionPolicy | null
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
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
  portadaUpdatedAt,
  imageKitFolder,
  approvedReviews,
  initialReviewsTotalCount,
  reviewStats,
}: {
  accommodation: AccommodationWithExtras
  thumbUrls: string[]
  fullUrls: string[]
  portadaPath: string | null
  portadaUpdatedAt: string | null
  imageKitFolder: string
  approvedReviews: ApprovedReview[]
  initialReviewsTotalCount: number
  reviewStats: ReviewStats
}) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const d = copy.pages.accommodationDetail
  const numberLocale = locale === "en" ? "en-US" : "es-AR"
  const [liveDescripcionEn, setLiveDescripcionEn] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const slug = String(accommodation.slug || "").trim()
    if (!slug) return

    void (async () => {
      const { data } = await supabase
        .from("alojamientos_aprobados")
        .select("descripcion_en")
        .eq("slug", slug)
        .maybeSingle()

      if (cancelled) return
      const value = String(data?.descripcion_en ?? "").trim()
      setLiveDescripcionEn(value || null)
    })()

    return () => {
      cancelled = true
    }
  }, [accommodation.slug])

  const displayDescription = React.useMemo(
    () =>
      resolveAccommodationDescription(
        {
          descripcion: accommodation.descripcion,
          descripcion_en: liveDescripcionEn ?? accommodation.descripcion_en,
        },
        locale,
      ),
    [accommodation.descripcion, accommodation.descripcion_en, liveDescripcionEn, locale],
  )
  const displayBedLayout = React.useMemo(
    () => translateStayInfoValue(accommodation.distribucion_camas, locale, "beds"),
    [accommodation.distribucion_camas, locale],
  )
  const displayCancellation = React.useMemo(
    () => translateStayInfoValue(accommodation.cancelacion, locale, "cancellation"),
    [accommodation.cancelacion, locale],
  )
  const showBedLayout = React.useMemo(
    () => hasBedLayoutData(accommodation.distribucion_camas),
    [accommodation.distribucion_camas],
  )
  const showCancellation = React.useMemo(
    () => hasCancellationData(accommodation.cancelacion),
    [accommodation.cancelacion],
  )

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
      title: `${copy.featuredAccommodations.shareTitle} - ${accommodation.nombre}`,
      text: copy.featuredAccommodations.shareText(accommodation.nombre),
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
        return d.featGuests(value as number)
      case "bedrooms":
        return d.featBedrooms(value as number)
      case "bathrooms":
        return d.featBathrooms(value as number)
      case "wifi":
        return value ? d.featWifiOn : d.featWifiOff
      case "ac":
        return value ? d.featAcOn : null
      case "pool":
        return value ? d.featPoolOn : null
      case "pet":
        return value ? d.featPetOn : d.featPetOff
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
  const rawMapsUrl = String(accommodation.google_maps ?? accommodation.ubicacion_google_maps ?? "").trim()

  const [resolvedMapsUrl, setResolvedMapsUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!rawMapsUrl) {
      setResolvedMapsUrl(null)
      return
    }
    if (!needsGoogleMapsRedirectResolve(rawMapsUrl)) {
      setResolvedMapsUrl(rawMapsUrl)
      return
    }

    let cancelled = false
    setResolvedMapsUrl(null)
    void fetch(`/api/maps/resolve-google-maps?url=${encodeURIComponent(rawMapsUrl)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: unknown) => {
        if (cancelled) return
        const maybe =
          typeof j === "object" && j && typeof (j as { url?: unknown }).url === "string"
            ? String((j as { url: string }).url).trim()
            : ""
        setResolvedMapsUrl(maybe || rawMapsUrl)
      })
      .catch(() => {
        if (!cancelled) setResolvedMapsUrl(rawMapsUrl)
      })
    return () => {
      cancelled = true
    }
  }, [rawMapsUrl])

  const mapsUrlStillResolving = Boolean(
    rawMapsUrl && needsGoogleMapsRedirectResolve(rawMapsUrl) && resolvedMapsUrl === null
  )

  const urlForPin = React.useMemo(() => {
    if (!rawMapsUrl) return null
    if (needsGoogleMapsRedirectResolve(rawMapsUrl) && resolvedMapsUrl === null) return null
    return (resolvedMapsUrl ?? rawMapsUrl).trim() || null
  }, [rawMapsUrl, resolvedMapsUrl])

  const mapPin = React.useMemo(
    () => getAccommodationMapPin(lat, lng, urlForPin, "detail"),
    [lat, lng, urlForPin]
  )

  const googleMapsHref = React.useMemo(
    () =>
      buildGoogleMapsHref({
        lat,
        lng,
        rawUrl: accommodation.google_maps ?? accommodation.ubicacion_google_maps,
      }),
    [lat, lng, accommodation.google_maps, accommodation.ubicacion_google_maps]
  )

  const showUbicacionSection = Boolean(googleMapsHref || mapPin || mapsUrlStillResolving)

  const folderSlug = (accommodation.slug || slugify(accommodation.nombre || "")).trim()
  const mediaFolder = imageKitFolder || folderSlug
  const galleryVideo = React.useMemo(
    () => getAccommodationGalleryVideo(folderSlug, accommodation.nombre),
    [folderSlug, accommodation.nombre],
  )
  const hasGallery = (thumbUrls.length > 0 && fullUrls.length > 0) || Boolean(galleryVideo)

  const heroFileName = React.useMemo(() => {
    if (portadaPath) return portadaPath.split("?")[0]?.trim() || null
    const firstThumb = thumbUrls[0]
    if (!firstThumb) return null
    const segment = firstThumb.split("/").pop()
    return segment?.split("?")[0]?.trim() || null
  }, [portadaPath, thumbUrls])

  const heroPath = heroFileName
    ? appendImageKitCacheVersion(
        `${heroFileName}?${IK_TRANSFORMS.heroPage}`,
        imageKitCacheVersion(portadaUpdatedAt),
      )
    : null

  return (
    <div className="min-h-screen bg-white pb-20 overflow-hidden">
      <section
        ref={containerRef}
        className="relative flex h-[60vh] min-h-[28rem] w-full flex-col overflow-hidden md:h-[75vh] md:min-h-0 md:flex md:items-end"
      >
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/20 md:via-black/20 md:to-transparent" />
          {heroPath ? (
            <CustomImage
              path={heroPath}
              folder="ALOJAMIENTOS"
              subfolder={mediaFolder}
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

        <div className="relative z-20 container mx-auto flex min-h-0 w-full flex-1 flex-col px-4 pb-8 pt-20 text-white pointer-events-none md:block md:flex-none md:p-20 md:pb-32">
          <Link
            href="/alojamientos"
            className="inline-flex shrink-0 items-center gap-2 py-1.5 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] transition-colors hover:text-white pointer-events-auto md:hidden"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span className="font-medium tracking-tight">{d.backCatalog}</span>
          </Link>

          <div className="min-h-2 flex-1 md:hidden" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex shrink-0 flex-col justify-between gap-8 md:flex-row md:items-end"
          >
            <div className="min-w-0">
              <Link
                href="/alojamientos"
                className="mb-6 hidden items-center text-white/80 transition-all hover:-translate-x-1 hover:text-white pointer-events-auto md:inline-flex"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium tracking-tight">{d.backCatalog}</span>
              </Link>
              <div className="mb-4 flex flex-wrap gap-3 md:mb-6">
                <Badge className="bg-white/95 text-black hover:bg-white border-none text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-xl">
                  {accommodation.tipo_alojamiento}
                </Badge>
              </div>
              <h1 className="mb-4 text-[1.75rem] font-black leading-[1.1] tracking-tighter drop-shadow-2xl sm:text-4xl md:text-6xl md:leading-none">
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
                      <span className="font-bold">{d.share}</span>
                    </Button>
                  </motion.div>
                </div>

                {(String(accommodation.direccion || "").trim() || googleMapsHref) && (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60 pointer-events-auto">
                    {String(accommodation.direccion || "").trim() && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{String(accommodation.direccion || "").trim()}</span>
                      </div>
                    )}
                    {googleMapsHref && (
                      <a
                        href={googleMapsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-bold hover:text-white transition-colors"
                      >
                        {d.viewGoogleMaps}
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
            <span className="font-bold">{d.toastCopied}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        {hasGallery && (
          <section className="mt-10 md:mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{d.gallery}</h2>
            <GaleriaAlojamiento
              thumbUrls={thumbUrls}
              fullUrls={fullUrls}
              nombreAlojamiento={accommodation.nombre}
              galleryVideo={galleryVideo}
            />
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
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{d.aboutTitle}</h3>
                    <p className="text-lg leading-relaxed font-light">{displayDescription}</p>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">{d.servicesTitle}</h3>
                    {uniqueServices.length === 0 ? (
                      <div className="text-slate-500 text-sm font-medium">{d.noServices}</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                        {uniqueServices.map((servicio) => {
                          const IconComponent = getIconByKey(servicio.icono_key)
                          return (
                            <div key={servicio.key} className="flex items-center gap-2 text-slate-700 min-w-0">
                              <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {translateAccommodationService(servicio.nombre, locale)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-12 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{d.stayTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                        <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{d.labelGuests}</div>
                          <div className="text-sm font-bold text-slate-800">
                            {derivedFeatures.guests || accommodation.capacidad_total || "—"}
                          </div>
                        </div>
                      </div>

                      {showBedLayout && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <BedDouble className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              {d.labelBeds}
                            </div>
                            <div className="text-sm font-bold text-slate-800 break-words whitespace-pre-line">{displayBedLayout}</div>
                          </div>
                        </div>
                      )}

                      {String(accommodation.check_in || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{d.labelCheckIn}</div>
                            <div className="text-sm font-bold text-slate-800">{String(accommodation.check_in)}</div>
                          </div>
                        </div>
                      )}

                      {String(accommodation.check_out || "").trim() && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                          <LogOut className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{d.labelCheckOut}</div>
                            <div className="text-sm font-bold text-slate-800">{String(accommodation.check_out)}</div>
                          </div>
                        </div>
                      )}

                      {showCancellation && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100 sm:col-span-2">
                          <CalendarX2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{d.labelCancel}</div>
                            <div className="text-sm font-bold text-slate-800 break-words">{displayCancellation}</div>
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
                      {accommodation.precio_base ? `$${accommodation.precio_base.toLocaleString(numberLocale)}` : d.askPrice}
                    </span>
                    <span className="text-base text-slate-400 font-medium mb-1">{d.perNight}</span>
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-slate-500 pt-2">
                    {d.minStay(Number(accommodation.noches_minimas) || 1)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      className="w-full bg-[#1a1f2c] hover:bg-primary text-white shadow-2xl text-lg h-20 rounded-full font-bold"
                    >
                      <a
                        href={`https://wa.me/5493546525404?text=${encodeURIComponent(d.waTemplate(accommodation.nombre))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-6 h-6 mr-3" />
                        {d.ctaWhatsapp}
                      </a>
                    </Button>
                  </motion.div>
                  <p className="text-sm text-center text-slate-400 font-medium leading-relaxed">{d.whatsappHint}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {showUbicacionSection ? (
          <section className="mt-12 lg:mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{d.locationTitle}</h2>
            <div className="h-[360px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white relative">
              {mapsUrlStillResolving ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MapPin className="w-12 h-12 text-primary mb-4 animate-pulse" />
                  <p className="text-slate-600 font-medium">{d.loadingMap}</p>
                </div>
              ) : mapPin && googleMapsHref ? (
                <AlojamientoDetailLocationMap
                  position={[mapPin.lat, mapPin.lng]}
                  googleMapsHref={googleMapsHref}
                  titulo={accommodation.nombre}
                  className="h-[360px] w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MapPin className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{d.mapHelpTitle}</h3>
                  <p className="text-slate-500 mb-6 max-w-md">{d.mapHelpBody}</p>
                  {googleMapsHref ? (
                    <Button
                      asChild
                      className="w-full max-w-xs bg-primary hover:bg-primary/90 text-white shadow-xl text-lg h-12 rounded-full font-bold"
                    >
                      <a href={googleMapsHref} target="_blank" rel="noopener noreferrer">
                        {d.mapOpenBtn}
                      </a>
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <AccommodationReviewsSection
        alojamientoId={accommodation.id}
        initialApprovedReviews={approvedReviews}
        initialTotalCount={initialReviewsTotalCount}
        reviewStats={reviewStats}
      />
    </div>
  )
}
