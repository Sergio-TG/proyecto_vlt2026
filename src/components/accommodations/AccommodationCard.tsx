"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import CustomImage from "@/components/common/CustomImage"
import { IK_TRANSFORMS } from "@/lib/imagekit.config"
import type { AlojamientoAprobado } from "@/lib/supabase-queries"
import { slugify } from "@/lib/utils"
import { motion } from "framer-motion"
import { Gem, Leaf, MapPin, Share2, Star, Users, Wifi, PawPrint } from "lucide-react"

const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const cardHoverTransition = { duration: 0.7, ease: premiumEase }
const imageHoverTransition = { duration: 1.5, ease: premiumEase }

const cardHoverVariants = {
  rest: { y: 0, scale: 1, rotate: 0 },
  hover: { y: -8, scale: 1.008, rotate: -0.15 },
  tap: { y: -2, scale: 0.99, rotate: 0 },
}

const imageHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -6 },
}

const ctaHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -1 },
  tap: { scale: 0.98, y: 0 },
}

const priceHoverVariants = {
  rest: { y: 0, opacity: 1 },
  hover: { y: -1, opacity: 1 },
}

function normalizeService(service: string) {
  return service
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export type AccommodationCardVariant = "home" | "listing"

export type AccommodationCardProps = {
  variant: AccommodationCardVariant
  item: AlojamientoAprobado
  portadaFile?: string | null
  onShare: (e: React.MouseEvent<HTMLButtonElement>, slug: string, title: string) => void
}

export function AccommodationCard({ item, portadaFile, onShare }: AccommodationCardProps) {
  const slug = item.slug || slugify(item.nombre)
  const ctaText = "+ Info"

  const servicios = Array.isArray(item.servicios) ? item.servicios : []
  const normalized = servicios.map(normalizeService)

  const hasWifi = normalized.some((s) => s.includes("wifi"))
  const hasPetFriendly =
    String(item.mascotas || "").trim().toLowerCase() === "sí" ||
    String(item.mascotas || "").trim().toLowerCase() === "si" ||
    normalized.some((s) => s.includes("pet") || s.includes("mascota") || s.includes("acepta mascotas"))

  const capacidad = item.capacidad_total || servicios.find((s) => s.includes("Capacidad"))?.match(/\d+/)?.[0] || "—"

  return (
    <Link href={`/alojamientos/${slug}`} className="block w-full">
      <motion.div
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        transition={cardHoverTransition}
        className="w-full"
      >
        <Card className="group w-full overflow-hidden border-0 ring-0 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col rounded-[2rem] bg-white relative cursor-pointer">
          <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0 rounded-t-[2rem] -mt-4 z-0">
            <motion.div variants={imageHoverVariants} transition={imageHoverTransition} className="relative w-full h-full">
              {portadaFile ? (
                <CustomImage
                  path={`${String(portadaFile).split("?")[0]}?${IK_TRANSFORMS.card}`}
                  folder="ALOJAMIENTOS"
                  subfolder={slug}
                  alt={item.nombre}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <div className="px-6 text-center text-slate-600 font-black text-sm md:text-base leading-snug">{item.nombre}</div>
                </div>
              )}
            </motion.div>

            <motion.div variants={priceHoverVariants} className="absolute top-4 left-4 z-20">
              <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm border-none shadow-sm px-2.5 py-1 rounded-full font-black text-[8px] uppercase tracking-wider flex items-center gap-1">
                {item.rating_google && item.rating_google >= 4.8 ? (
                  <>
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> MÁS PEDIDO
                  </>
                ) : item.precio_base && item.precio_base > 100000 ? (
                  <>
                    <Gem className="w-2.5 h-2.5 text-blue-500" /> PREMIUM
                  </>
                ) : (
                  <>
                    <Leaf className="w-2.5 h-2.5 text-green-500" /> ECO-FRIENDLY
                  </>
                )}
              </Badge>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => onShare(e, slug, item.nombre)}
              className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md border border-white/20 text-slate-700 hover:bg-primary hover:text-white transition-all duration-300"
              title="Compartir alojamiento"
            >
              <Share2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="flex flex-col flex-grow p-5 pt-4 space-y-3 relative z-20">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-0.5 flex-grow">
                <h3 className="font-black text-[15px] text-slate-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                  {item.nombre}
                </h3>
                <div className="flex items-center text-[#38bdf8] text-[10px] font-bold">
                  <MapPin className="w-3 h-3 mr-1 fill-[#7dd3fc]/20 flex-shrink-0" />
                  <span className="truncate uppercase tracking-tight">{item.localidad}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm flex-shrink-0">
                <Star className="w-3 h-3 fill-[#2563eb]" />
                {item.rating_google || "—"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-bold">{capacidad} Personas</span>
              </div>

              {hasWifi && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[10px] font-bold">Wi-Fi</span>
                </div>
              )}

              {hasPetFriendly && (
                <div className="flex items-center gap-1 text-slate-400">
                  <PawPrint className="w-3 h-3" />
                  <span className="text-[10px] font-bold">Pet Friendly</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between gap-2 mt-auto border-t border-slate-50">
              <motion.div variants={priceHoverVariants} className="flex flex-col min-w-0">
                {item.precio_base ? (
                  <div className="flex items-baseline flex-wrap gap-x-1">
                    <span className="text-lg xl:text-xl font-black text-slate-900 leading-none">
                      {`$${item.precio_base.toLocaleString("es-AR")}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">por noche</span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-slate-900 leading-none">Consultar</span>
                )}
              </motion.div>

              <motion.div
                variants={ctaHoverVariants}
                transition={cardHoverTransition}
                className="flex-shrink-0 h-9 sm:h-10 px-4 sm:px-5 rounded-full font-bold text-[11px] sm:text-[12px] bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center whitespace-nowrap"
              >
                {ctaText}
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
