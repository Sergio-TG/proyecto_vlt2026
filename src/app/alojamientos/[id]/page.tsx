import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { onlyActiveAlojamientos } from "@/lib/alojamientos-active"
import { buildGaleriaUrls } from "@/lib/imagekit.config"
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

export default async function AccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slug = String(id || "").trim()
  if (!slug) notFound()

  const { data, error } = await onlyActiveAlojamientos(
    supabase.from("alojamientos_aprobados").select("*").eq("slug", slug),
  ).single()
  if (error || !data) notFound()

  const accommodation = data as unknown as AccommodationWithExtras
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
