import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getServerSupabase } from "@/lib/supabase-server"
import { onlyActiveAlojamientos } from "@/lib/alojamientos-active"
import { buildGaleriaUrls, getAlojamientoPortada } from "@/lib/imagekit.config"
import { resolveAlojamientoImageKitGaleria } from "@/lib/imagekit"
import { AccommodationDetailClient } from "./AccommodationDetailClient"
import type { AlojamientoAprobado } from "@/lib/supabase-queries"
import { parseApprovedReviewRow, REVIEWS_PAGE_SIZE, type ApprovedReview } from "@/lib/reviews"
import { computeReviewStats, type ReviewStats } from "@/lib/review-stats"
import { slugify } from "@/lib/utils"

type AccommodationWithExtras = AlojamientoAprobado & {
  google_maps?: string | null
  ubicacion_google_maps?: string | null
  link_drive?: string | null
}

export const dynamic = "force-dynamic"

const SITE_URL = "https://www.vivilastermas.com"

function truncateMetaDescription(text: string, max = 155): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return ""
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max - 1).trimEnd()}…`
}

function buildAlojamientoDescription(row: {
  descripcion?: string | null
  localidad?: string | null
  tipo_alojamiento?: string | null
  mascotas?: string | null
  nombre?: string | null
}): string {
  const fromDb = truncateMetaDescription(String(row.descripcion || ""))
  if (fromDb) return fromDb

  const nombre = String(row.nombre || "Alojamiento").trim()
  const localidad = String(row.localidad || "Villa Yacanto").trim()
  const tipo = String(row.tipo_alojamiento || "cabañas").trim().toLowerCase()
  const mascotasNorm = String(row.mascotas || "").trim().toLowerCase()
  const petFriendly = mascotasNorm === "sí" || mascotasNorm === "si"

  const petPhrase = petFriendly ? " alojamiento pet friendly" : ""
  return truncateMetaDescription(
    `${nombre}: ${tipo} en ${localidad}${petPhrase}. Alquiler en Villa Yacanto y El Durazno — Viví las Termas.`,
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const slug = String(id || "").trim()
  if (!slug) return { title: "Alojamiento | Viví las Termas" }

  const db = getServerSupabase() ?? supabase
  const { data } = await onlyActiveAlojamientos(
    db
      .from("alojamientos_aprobados")
      .select("nombre, slug, descripcion, localidad, tipo_alojamiento, mascotas")
      .eq("slug", slug),
  ).maybeSingle()

  if (!data) {
    return { title: "Alojamiento | Viví las Termas", robots: { index: false, follow: false } }
  }

  const nombre = String(data.nombre || "Alojamiento").trim()
  const title = `${nombre} | Alquiler en Villa Yacanto - Viví las Termas`
  const description = buildAlojamientoDescription(data)
  const imageUrl = getAlojamientoPortada(String(data.slug || slug), "galFull")
  const canonical = `${SITE_URL}/alojamientos/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: imageUrl, alt: nombre }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function AccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slug = String(id || "").trim()
  if (!slug) notFound()

  const db = getServerSupabase() ?? supabase
  const { data, error } = await onlyActiveAlojamientos(
    db.from("alojamientos_aprobados").select("*").eq("slug", slug),
  ).single()
  if (error || !data) notFound()

  const accommodation = data as unknown as AccommodationWithExtras
  if (!String(accommodation.descripcion_en ?? "").trim()) {
    const { data: pendingRow } = await db
      .from("alojamientos_pendientes")
      .select("descripcion_en")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const pendingEn = String(pendingRow?.descripcion_en ?? "").trim()
    if (pendingEn) {
      accommodation.descripcion_en = pendingEn
    }
  }

  const folderSlug = String(accommodation.slug || slug).trim()
  const fallbackFolderByName = slugify(String(accommodation.nombre || ""))

  const { imageKitFolder, archivos, updatedAtByName } = await resolveAlojamientoImageKitGaleria(folderSlug, [
    fallbackFolderByName,
  ])
  const mediaFolder = imageKitFolder ?? folderSlug

  const list = Array.from(new Set(archivos.filter(Boolean).map((n) => String(n).trim()).filter(Boolean)))

  const portadaFromList = list.find((n) => (n.split("?")[0] ?? "").toLowerCase() === "portada.webp")
  const portada = portadaFromList || list[0] || ""
  const portadaPath = portada ? String(portada).trim() : null
  const portadaUpdatedAt = portadaPath ? updatedAtByName[portadaPath] ?? null : null
  const ordered = portada ? [portada, ...list.filter((n) => n !== portada)] : list

  const thumbUrls = buildGaleriaUrls(mediaFolder, ordered, "galThumb", updatedAtByName)
  const fullUrls = buildGaleriaUrls(mediaFolder, ordered, "galFull", updatedAtByName)

  const [{ data: approvedReviewsRaw, count: totalReviewCount }, { data: statsRowsRaw }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, nombre_usuario, estrellas_alojamiento, estrellas_plataforma, comentario, fotos, created_at", {
        count: "exact",
      })
      .eq("alojamiento_id", accommodation.id)
      .eq("aprobada", true)
      .order("created_at", { ascending: false })
      .range(0, REVIEWS_PAGE_SIZE - 1),
    supabase
      .from("reviews")
      .select("estrellas_alojamiento, estrellas_plataforma")
      .eq("alojamiento_id", accommodation.id)
      .eq("aprobada", true),
  ])

  const approvedReviews: ApprovedReview[] = (approvedReviewsRaw ?? []).map(parseApprovedReviewRow)

  const reviewStats: ReviewStats = computeReviewStats(
    (statsRowsRaw ?? []).map((row) => ({
      estrellas_alojamiento: Number(row.estrellas_alojamiento),
      estrellas_plataforma: Number(row.estrellas_plataforma),
    })),
  )

  const initialReviewsTotalCount = totalReviewCount ?? approvedReviews.length

  return (
    <AccommodationDetailClient
      accommodation={accommodation}
      thumbUrls={thumbUrls}
      fullUrls={fullUrls}
      portadaPath={portadaPath}
      portadaUpdatedAt={portadaUpdatedAt}
      imageKitFolder={mediaFolder}
      approvedReviews={approvedReviews}
      initialReviewsTotalCount={initialReviewsTotalCount}
      reviewStats={reviewStats}
    />
  )
}
