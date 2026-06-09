import "server-only"

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
