import "server-only"
import {
  ALLOWED_GALLERY_MIME,
  MAX_GALLERY_IMAGE_BYTES,
  MAX_GALLERY_VIDEO_BYTES,
  galleryItemType,
} from "@/lib/blog-media.config"
import type { BlogGalleryItem } from "@/lib/blog"

const MAX_REVIEW_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function getImageKitPrivateKey() {
  const k =
    process.env.IMAGEKIT_PRIVATE_KEY ||
    process.env.IMAGEKIT_PRIVATE ||
    process.env.IMAGEKIT_PRIVATEKEY ||
    process.env.IMAGEKIT_PRIVATE_KEY_ENV
  return (k || "").trim()
}

function buildAuthHeader(privateKey: string) {
  const token = Buffer.from(`${privateKey}:`).toString("base64")
  return `Basic ${token}`
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-")
  return base.length > 0 ? base.slice(0, 120) : "foto.jpg"
}

export function validateReviewPhotoFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Formato no permitido. Usá JPG, PNG, WEBP o GIF."
  }
  if (file.size > MAX_REVIEW_PHOTO_BYTES) {
    return "Cada foto debe pesar como máximo 5 MB."
  }
  return null
}

export async function uploadReviewPhotoToImageKit(
  file: File,
  alojamientoId: string,
): Promise<string> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) {
    throw new Error("ImageKit no está configurado en el servidor.")
  }

  const validationError = validateReviewPhotoFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const safeId = String(alojamientoId || "")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "")
  if (!safeId) {
    throw new Error("Identificador de alojamiento inválido.")
  }

  const formData = new FormData()
  formData.append("file", file, sanitizeFileName(file.name))
  formData.append("fileName", sanitizeFileName(file.name))
  formData.append("folder", `/resenas/${safeId}`)
  formData.append("useUniqueFileName", "true")

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: buildAuthHeader(privateKey) },
    body: formData,
  })

  const text = await res.text()
  const json = (() => {
    try {
      return text ? (JSON.parse(text) as { url?: string; message?: string }) : null
    } catch {
      return null
    }
  })()

  if (!res.ok) {
    throw new Error(json?.message || text || "Error al subir la imagen a ImageKit.")
  }

  const url = json?.url?.trim()
  if (!url) {
    throw new Error("ImageKit no devolvió la URL de la imagen.")
  }

  return url
}

export function validateBlogGalleryFile(file: File): string | null {
  const kind = galleryItemType(file.type)
  if (!kind) {
    return "Formato no permitido. Usá JPG, PNG, WEBP, GIF, MP4 o WEBM."
  }
  const max = kind === "video" ? MAX_GALLERY_VIDEO_BYTES : MAX_GALLERY_IMAGE_BYTES
  if (file.size > max) {
    return kind === "video"
      ? "Cada video no puede superar los 80 MB."
      : "Cada imagen no puede superar los 10 MB."
  }
  return null
}

/** Sube una imagen o video de galería del blog a ImageKit, en `/blog/{slug}/`. */
export async function uploadBlogGalleryFileToImageKit(
  file: File,
  slug: string,
): Promise<BlogGalleryItem> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) {
    throw new Error("ImageKit no está configurado en el servidor.")
  }

  if (!ALLOWED_GALLERY_MIME.has(file.type)) {
    throw new Error("Formato no permitido. Usá JPG, PNG, WEBP, GIF, MP4 o WEBM.")
  }

  const validationError = validateBlogGalleryFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const safeSlug = String(slug || "borrador")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "borrador"

  const kind = galleryItemType(file.type)

  const formData = new FormData()
  formData.append("file", file, sanitizeFileName(file.name))
  formData.append("fileName", sanitizeFileName(file.name))
  formData.append("folder", `/blog/${safeSlug}`)
  formData.append("useUniqueFileName", "true")

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: buildAuthHeader(privateKey) },
    body: formData,
  })

  const text = await res.text()
  const json = (() => {
    try {
      return text ? (JSON.parse(text) as { url?: string; message?: string }) : null
    } catch {
      return null
    }
  })()

  if (!res.ok) {
    throw new Error(json?.message || text || "Error al subir el archivo a ImageKit.")
  }

  const url = json?.url?.trim()
  if (!url) {
    throw new Error("ImageKit no devolvió la URL del archivo.")
  }

  return { url, type: kind === "video" ? "video" : "image" }
}

export async function uploadAvatarToImageKit(file: File, userId: string): Promise<string> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) {
    throw new Error("ImageKit no está configurado en el servidor.")
  }

  const validationError = validateReviewPhotoFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const safeId = String(userId || "")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "")
  if (!safeId) {
    throw new Error("Identificador de usuario inválido.")
  }

  const formData = new FormData()
  formData.append("file", file, sanitizeFileName(file.name))
  formData.append("fileName", sanitizeFileName(file.name))
  formData.append("folder", `/avatars/${safeId}`)
  formData.append("useUniqueFileName", "true")

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: buildAuthHeader(privateKey) },
    body: formData,
  })

  const text = await res.text()
  const json = (() => {
    try {
      return text ? (JSON.parse(text) as { url?: string; message?: string }) : null
    } catch {
      return null
    }
  })()

  if (!res.ok) {
    throw new Error(json?.message || text || "Error al subir la imagen a ImageKit.")
  }

  const url = json?.url?.trim()
  if (!url) {
    throw new Error("ImageKit no devolvió la URL de la imagen.")
  }

  return url
}
