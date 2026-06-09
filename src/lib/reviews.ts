export type ReviewRow = {
  id: string
  alojamiento_id: string
  nombre_usuario: string
  estrellas_alojamiento: number
  estrellas_plataforma: number
  comentario: string | null
  fotos: string[]
  created_at: string
  aprobada: boolean
}

export type ApprovedReview = Pick<
  ReviewRow,
  | "id"
  | "nombre_usuario"
  | "estrellas_alojamiento"
  | "estrellas_plataforma"
  | "comentario"
  | "fotos"
  | "created_at"
>

export const REVIEWS_PAGE_SIZE = 5

export const APPROVED_REVIEW_SELECT =
  "id, nombre_usuario, estrellas_alojamiento, estrellas_plataforma, comentario, fotos, created_at"

export function parseApprovedReviewRow(row: {
  id: unknown
  nombre_usuario: unknown
  estrellas_alojamiento: unknown
  estrellas_plataforma: unknown
  comentario: unknown
  fotos: unknown
  created_at: unknown
}): ApprovedReview {
  return {
    id: String(row.id),
    nombre_usuario: String(row.nombre_usuario ?? ""),
    estrellas_alojamiento: Number(row.estrellas_alojamiento),
    estrellas_plataforma: Number(row.estrellas_plataforma),
    comentario: row.comentario == null ? null : String(row.comentario),
    fotos: normalizeReviewFotos(row.fotos),
    created_at: String(row.created_at ?? ""),
  }
}

export type ReviewPendingModeration = Pick<
  ReviewRow,
  | "id"
  | "alojamiento_id"
  | "nombre_usuario"
  | "estrellas_alojamiento"
  | "estrellas_plataforma"
  | "comentario"
  | "fotos"
  | "created_at"
> & {
  alojamiento_nombre: string | null
}

export type ReviewInsertPayload = {
  alojamiento_id: string
  nombre_usuario: string
  estrellas_alojamiento: number
  estrellas_plataforma: number
  comentario: string
  fotos: string[]
  aprobada: false
  created_at: string
}

export function normalizeReviewFotos(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (!trimmed) return []
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean)
        }
      } catch {
        return []
      }
    }
    return [trimmed]
  }
  return []
}
