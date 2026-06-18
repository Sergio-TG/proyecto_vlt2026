import { slugify } from "@/lib/utils"

export type AccommodationGalleryVideo = {
  embedUrl: string
  thumbUrl: string
  /** Texto de la miniatura: dron (default) o presentación del hotel. */
  variant?: "dron" | "presentation"
}

const LA_ENSENADA_DRON_VIDEO: AccommodationGalleryVideo = {
  embedUrl: "https://player.cloudinary.com/embed/?cloud_name=dxpy1zqj6&public_id=dron-video_qyryar",
  thumbUrl:
    "https://res.cloudinary.com/dxpy1zqj6/video/upload/so_0,w_1200,h_800,c_fill,q_auto,f_jpg/dron-video_qyryar",
}

const CASABLANCA_PRESENTATION_VIDEO: AccommodationGalleryVideo = {
  embedUrl: "https://player.cloudinary.com/embed/?cloud_name=dxpy1zqj6&public_id=IngresoHotel_eblue7",
  thumbUrl:
    "https://res.cloudinary.com/dxpy1zqj6/video/upload/so_0,w_1200,h_800,c_fill,q_auto,f_jpg/IngresoHotel_eblue7",
  variant: "presentation",
}

/** Videos embebidos en galería por slug de alojamiento (Cloudinary player). */
const GALLERY_VIDEOS_BY_SLUG: Record<string, AccommodationGalleryVideo> = {
  "la-ensenada": LA_ENSENADA_DRON_VIDEO,
  "casablanca-hotel-spa": CASABLANCA_PRESENTATION_VIDEO,
}

export function getAccommodationGalleryVideo(
  slug: string,
  nombre?: string | null,
): AccommodationGalleryVideo | null {
  const normalizedSlug = String(slug || "")
    .trim()
    .toLowerCase()
  if (normalizedSlug && GALLERY_VIDEOS_BY_SLUG[normalizedSlug]) {
    return GALLERY_VIDEOS_BY_SLUG[normalizedSlug]
  }

  const fromName = slugify(String(nombre || "").trim())
  if (fromName && GALLERY_VIDEOS_BY_SLUG[fromName]) {
    return GALLERY_VIDEOS_BY_SLUG[fromName]
  }

  return null
}
