import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { buildGaleriaUrls } from "@/lib/imagekit.config"
import { getArchivosAlojamiento, getPortadaAlojamiento } from "@/lib/imagekit"
import { AccommodationDetailClient } from "./AccommodationDetailClient"
import type { AlojamientoAprobado } from "@/lib/supabase-queries"

type AccommodationWithExtras = AlojamientoAprobado & {
  google_maps?: string | null
  ubicacion_google_maps?: string | null
  link_drive?: string | null
}

export default async function AccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slug = String(id || "").trim()
  if (!slug) notFound()

  const { data, error } = await supabase.from("alojamientos_aprobados").select("*").eq("slug", slug).single()
  if (error || !data) notFound()

  const accommodation = data as unknown as AccommodationWithExtras
  const folderSlug = String(accommodation.slug || slug).trim()

  const [archivos, portadaPath] = await Promise.all([
    getArchivosAlojamiento(folderSlug),
    getPortadaAlojamiento(folderSlug),
  ])

  const list = Array.from(new Set(archivos.filter(Boolean).map((n) => String(n).trim()).filter(Boolean)))

  const portadaFromList = list.find((n) => (n.split("?")[0] ?? "").toLowerCase() === "portada.webp")
  const portada = portadaFromList || (portadaPath ? String(portadaPath).trim() : "")
  const ordered = portada ? [portada, ...list.filter((n) => n !== portada)] : list

  const thumbUrls = buildGaleriaUrls(folderSlug, ordered, "galThumb")
  const fullUrls = buildGaleriaUrls(folderSlug, ordered, "galFull")

  return (
    <AccommodationDetailClient
      accommodation={accommodation}
      thumbUrls={thumbUrls}
      fullUrls={fullUrls}
      portadaPath={portadaPath}
    />
  )
}
