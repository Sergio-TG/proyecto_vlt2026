/**
 * Reglas de validación para los archivos multimedia del blog (audio, imágenes
 * y videos de galería). Se usan tanto en el cliente (antes de subir, para dar
 * feedback inmediato) como en el servidor (para no confiar solo en el chequeo
 * del navegador).
 */

export const PODCASTS_BUCKET = "podcasts"

// Límite del tier gratuito de Supabase Storage por archivo.
export const MAX_AUDIO_BYTES = 45 * 1024 * 1024 // 45 MB

export const ALLOWED_AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
])

export const ALLOWED_AUDIO_EXTENSIONS = [".mp3", ".mp4", ".m4a", ".wav", ".aac", ".ogg"]

/**
 * Mapa extensión -> MIME "canónico" de audio. Es necesario porque muchos
 * navegadores reportan `.mp4`/`.m4a` como `video/mp4` (sniff por contenedor,
 * no por contenido real), lo que hace que Supabase Storage rechace la
 * subida al bucket `podcasts` (que solo permite MIME types de audio).
 */
const AUDIO_EXTENSION_MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".mp4": "audio/mp4",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
}

/** Devuelve el MIME type que hay que enviar al subir el audio, corrigiendo el sniff del navegador. */
export function resolveAudioContentType(file: { type?: string; name?: string }): string {
  const name = String(file.name || "").toLowerCase()
  const ext = ALLOWED_AUDIO_EXTENSIONS.find((candidate) => name.endsWith(candidate))
  if (ext && AUDIO_EXTENSION_MIME[ext]) return AUDIO_EXTENSION_MIME[ext]

  const type = String(file.type || "").toLowerCase()
  if (ALLOWED_AUDIO_MIME.has(type)) return type

  return "audio/mpeg"
}

// Imágenes y videos cortos de la galería (vía ImageKit).
export const MAX_GALLERY_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_GALLERY_VIDEO_BYTES = 80 * 1024 * 1024 // 80 MB (video corto)
export const MAX_GALLERY_ITEMS = 12

export const ALLOWED_GALLERY_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

export const ALLOWED_GALLERY_VIDEO_MIME = new Set(["video/mp4", "video/webm"])

export const ALLOWED_GALLERY_MIME = new Set([
  ...ALLOWED_GALLERY_IMAGE_MIME,
  ...ALLOWED_GALLERY_VIDEO_MIME,
])

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

export function isAudioFile(file: { type?: string; name?: string }): boolean {
  const type = String(file.type || "").toLowerCase()
  if (ALLOWED_AUDIO_MIME.has(type)) return true
  const name = String(file.name || "").toLowerCase()
  return ALLOWED_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext))
}

/** Valida un archivo de audio antes de iniciar la subida. Devuelve el mensaje de error o null. */
export function validateAudioFile(file: { type?: string; name?: string; size?: number }): string | null {
  if (!isAudioFile(file)) {
    return "Formato no permitido. Usá MP3, M4A, WAV, AAC u OGG."
  }
  if (typeof file.size === "number" && file.size > MAX_AUDIO_BYTES) {
    return `El audio no puede superar los ${formatMegabytes(MAX_AUDIO_BYTES)} (límite del plan de Supabase).`
  }
  return null
}

export function galleryItemType(mime: string): "image" | "video" | null {
  const type = String(mime || "").toLowerCase()
  if (ALLOWED_GALLERY_IMAGE_MIME.has(type)) return "image"
  if (ALLOWED_GALLERY_VIDEO_MIME.has(type)) return "video"
  return null
}

/** Valida un archivo de galería (imagen o video) antes de iniciar la subida. */
export function validateGalleryFile(file: { type?: string; size?: number }): string | null {
  const type = String(file.type || "").toLowerCase()
  const kind = galleryItemType(type)
  if (!kind) {
    return "Formato no permitido. Usá JPG, PNG, WEBP, GIF, MP4 o WEBM."
  }
  const max = kind === "video" ? MAX_GALLERY_VIDEO_BYTES : MAX_GALLERY_IMAGE_BYTES
  if (typeof file.size === "number" && file.size > max) {
    return kind === "video"
      ? `Cada video no puede superar los ${formatMegabytes(MAX_GALLERY_VIDEO_BYTES)}.`
      : `Cada imagen no puede superar los ${formatMegabytes(MAX_GALLERY_IMAGE_BYTES)}.`
  }
  return null
}
