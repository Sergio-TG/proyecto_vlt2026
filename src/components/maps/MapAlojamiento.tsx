"use client"

import * as React from "react"
import Link from "next/link"
import L from "leaflet"
import { AnimatePresence, motion } from "framer-motion"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { buildGaleriaUrls } from "@/lib/imagekit.config"
import { getAccommodationMapPin, isValidLatLng } from "@/lib/google-maps-embed"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

type MapListing = ReturnType<typeof getSiteCopy>["pages"]["mapListing"]

type MarkerItem = {
  id: string
  nombre: string
  localidad: string
  rating_google: number | null
  precio_base: number | null
  latitud: number
  longitud: number
  slug: string
  portadaUrl: string | null
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

function getBookingScore(
  ratingGoogle: number | null,
  m: { ratingExceptional: string; ratingExcellent: string; ratingVeryGood: string; ratingGood: string; ratingOk: string }
) {
  if (!ratingGoogle || !Number.isFinite(ratingGoogle)) return null
  const score = ratingGoogle * 2
  const label =
    score >= 9.5
      ? m.ratingExceptional
      : score >= 9
        ? m.ratingExcellent
        : score >= 8.5
          ? m.ratingVeryGood
          : score >= 8
            ? m.ratingGood
            : m.ratingOk
  return { score, label }
}

function HoverMarker({ marker, m, numberLocale }: { marker: MarkerItem; m: MapListing; numberLocale: string }) {
  const markerRef = React.useRef<L.Marker>(null)
  const closeTimeoutRef = React.useRef<number | null>(null)
  const isMarkerHoveredRef = React.useRef(false)
  const isPopupHoveredRef = React.useRef(false)
  const removePopupListenersRef = React.useRef<(() => void) | null>(null)

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const scheduleClose = React.useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isMarkerHoveredRef.current && !isPopupHoveredRef.current) {
        markerRef.current?.closePopup()
      }
    }, 200)
  }, [clearCloseTimeout])

  const attachPopupHoverListeners = React.useCallback(
    (popup: L.Popup) => {
      if (removePopupListenersRef.current) {
        removePopupListenersRef.current()
        removePopupListenersRef.current = null
      }

      const tryAttach = () => {
        const el = popup.getElement()
        if (!el) return false

        const onEnter = () => {
          isPopupHoveredRef.current = true
          clearCloseTimeout()
        }

        const onLeave = () => {
          isPopupHoveredRef.current = false
          scheduleClose()
        }

        el.addEventListener("mouseenter", onEnter)
        el.addEventListener("mouseleave", onLeave)

        removePopupListenersRef.current = () => {
          el.removeEventListener("mouseenter", onEnter)
          el.removeEventListener("mouseleave", onLeave)
        }

        return true
      }

      if (!tryAttach()) {
        window.requestAnimationFrame(() => {
          tryAttach()
        })
      }
    },
    [clearCloseTimeout, scheduleClose]
  )

  React.useEffect(() => {
    return () => {
      clearCloseTimeout()
      if (removePopupListenersRef.current) {
        removePopupListenersRef.current()
        removePopupListenersRef.current = null
      }
    }
  }, [clearCloseTimeout])

  const eventHandlers = React.useMemo(
    () => ({
      mouseover: () => {
        isMarkerHoveredRef.current = true
        clearCloseTimeout()
        markerRef.current?.openPopup()
      },
      mouseout: () => {
        isMarkerHoveredRef.current = false
        scheduleClose()
      },
      popupopen: (e: L.PopupEvent) => {
        attachPopupHoverListeners(e.popup)
      },
      popupclose: () => {
        isPopupHoveredRef.current = false
        if (removePopupListenersRef.current) {
          removePopupListenersRef.current()
          removePopupListenersRef.current = null
        }
      },
    }),
    [attachPopupHoverListeners, clearCloseTimeout, scheduleClose]
  )

  const icon = React.useMemo(() => {
    return L.divIcon({
      className: "brand-marker",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -38],
      html: `
        <div style="width:30px;height:42px;display:flex;align-items:center;justify-content:center">
          <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 1C8.4 1 3 6.4 3 13c0 9.3 12 28 12 28s12-18.7 12-28C27 6.4 21.6 1 15 1z" fill="#2563eb"/>
            <circle cx="15" cy="13" r="5" fill="white" opacity="0.95"/>
          </svg>
        </div>
      `,
    })
  }, [])

  const booking = getBookingScore(marker.rating_google, m)

  return (
    <Marker ref={markerRef} position={[marker.latitud, marker.longitud]} icon={icon} eventHandlers={eventHandlers}>
      <Popup className="map-popup">
        <Link href={`/alojamientos/${marker.slug}`} className="block w-[240px]">
          {marker.portadaUrl ? (
            <img src={marker.portadaUrl} alt={marker.nombre} className="w-full h-32 object-cover rounded-lg mb-3" />
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 leading-tight break-words">{marker.nombre}</p>
              <p className="text-xs text-slate-600 mt-1 leading-snug break-words">{marker.localidad}</p>
            </div>

            {booking ? (
              <div className="flex-shrink-0 bg-slate-900 text-white rounded-lg px-2 py-1 text-[10px] font-black">
                {booking.score.toFixed(1)} {booking.label}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-black text-slate-500">{m.priceLabel}</div>
              <div className="text-base font-black text-[#256b67] leading-none">
                {marker.precio_base ? `$ ${marker.precio_base.toLocaleString(numberLocale)}` : m.inquire}
              </div>
            </div>

            <span className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#4aa39e] text-white font-black text-sm hover:bg-[#3f9792] transition-colors">
              {m.ctaInfo}
            </span>
          </div>
        </Link>
      </Popup>
    </Marker>
  )
}

export default function MapAlojamiento({
  accommodations,
  portadaBySlug,
  imageKitFolderBySlug,
  portadaUpdatedAtBySlug,
}: {
  accommodations: AlojamientoAprobado[]
  portadaBySlug: Record<string, string | null>
  imageKitFolderBySlug?: Record<string, string | null>
  portadaUpdatedAtBySlug?: Record<string, string | null>
}) {
  const { locale } = useLanguage()
  const m = getSiteCopy(locale).pages.mapListing
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const expandBtnRef = React.useRef<HTMLButtonElement>(null)
  const closeBtnRef = React.useRef<HTMLButtonElement>(null)

  const closeFullscreen = React.useCallback(() => {
    setIsFullscreen(false)
    requestAnimationFrame(() => {
      expandBtnRef.current?.focus()
    })
  }, [])

  const openFullscreen = React.useCallback(() => {
    setIsFullscreen(true)
    requestAnimationFrame(() => {
      closeBtnRef.current?.focus()
    })
  }, [])

  React.useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  React.useEffect(() => {
    if (!isFullscreen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isFullscreen])

  React.useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeFullscreen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeFullscreen, isFullscreen])

  const markers = React.useMemo<MarkerItem[]>(() => {
    return accommodations.reduce<MarkerItem[]>((acc, a) => {
      const dbLat = toNum((a as { latitud?: unknown }).latitud)
      const dbLng = toNum((a as { longitud?: unknown }).longitud)
      const mapsUrl =
        (a as { google_maps?: string | null; ubicacion_google_maps?: string | null }).google_maps ??
        (a as { ubicacion_google_maps?: string | null }).ubicacion_google_maps

      const pin = getAccommodationMapPin(dbLat, dbLng, mapsUrl ?? null, "listing")

      if (!pin || !isValidLatLng(pin.lat, pin.lng)) {
        console.warn(
          `Aviso: El alojamiento ${String(a.nombre || "").trim()} no tiene coordenadas útiles en URL ni en DB, omitiendo en mapa`
        )
        return acc
      }

      const safeLat = pin.lat
      const safeLng = pin.lng

      const slug = a.slug || slugify(a.nombre)
      const portadaFile = portadaBySlug[slug]
      const mediaFolder = imageKitFolderBySlug?.[slug] ?? slug
      const portadaUrl = portadaFile
        ? buildGaleriaUrls(
            mediaFolder,
            [String(portadaFile)],
            "card",
            portadaUpdatedAtBySlug?.[slug] && portadaFile
              ? { [String(portadaFile)]: String(portadaUpdatedAtBySlug[slug]) }
              : undefined,
          )[0] ?? null
        : null

      acc.push({
        id: a.id,
        nombre: a.nombre,
        localidad: a.localidad,
        rating_google: a.rating_google ?? null,
        precio_base: a.precio_base ?? null,
        latitud: safeLat,
        longitud: safeLng,
        slug,
        portadaUrl,
      })
      return acc
    }, [])
  }, [accommodations, imageKitFolderBySlug, portadaBySlug, portadaUpdatedAtBySlug])

  const mapCenter = React.useMemo<[number, number]>(() => {
    if (markers.length === 0) return [-27.496, -64.859]
    const lat = markers.reduce((s, mk) => s + mk.latitud, 0) / markers.length
    const lng = markers.reduce((s, mk) => s + mk.longitud, 0) / markers.length
    return [lat, lng]
  }, [markers])

  if (markers.length === 0) {
    if (process.env.NODE_ENV !== "production" && accommodations.length > 0) {
      const sample = accommodations.slice(0, 3).map((a) => ({
        id: a.id,
        slug: a.slug,
        latitud: (a as { latitud?: unknown }).latitud,
        longitud: (a as { longitud?: unknown }).longitud,
        google_maps: (a as { google_maps?: unknown }).google_maps,
      }))
      console.warn("Mapa sin marcadores: revisar latitud/longitud o google_maps en alojamientos_aprobados.", sample)
    }
    return (
      <div className="h-[400px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        {m.noCoords}
      </div>
    )
  }

  const numberLocale = locale === "en" ? "en-US" : "es-AR"
  const renderMap = (mapKey: string, className: string) => (
    <MapContainer key={mapKey} center={mapCenter} zoom={12} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((mk) => (
        <HoverMarker key={`${mapKey}-${mk.id}`} marker={mk} m={m} numberLocale={numberLocale} />
      ))}
    </MapContainer>
  )

  return (
    <>
      <div className="relative h-[400px] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        {renderMap("inline", "h-full w-full z-0")}
        <button
          ref={expandBtnRef}
          type="button"
          onClick={openFullscreen}
          className="absolute right-4 top-4 z-[500] rounded-xl bg-white/95 px-4 py-2 text-sm font-black text-slate-900 shadow-lg backdrop-blur hover:bg-white"
        >
          {m.expandMap}
        </button>
      </div>

      <AnimatePresence>
        {isFullscreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-slate-950/80 p-3 md:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={m.expandMap}
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeFullscreen}
              aria-label={m.closeMapAria}
              className="fixed top-4 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl font-black leading-none text-slate-900 shadow-xl backdrop-blur-md transition-colors hover:bg-white md:top-6 md:right-6 cursor-pointer"
            >
              ✕
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.24 }}
              className="relative z-0 h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
            >
              {renderMap("fullscreen", "h-full w-full z-0")}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
