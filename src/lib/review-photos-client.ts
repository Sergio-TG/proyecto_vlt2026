export const MAX_REVIEW_PHOTOS = 3
export const MAX_REVIEW_PHOTO_BYTES = 5 * 1024 * 1024

export async function uploadReviewPhotos(files: File[], alojamientoId: string): Promise<string[]> {
  const urls: string[] = []

  for (const file of files) {
    const body = new FormData()
    body.append("file", file)
    body.append("alojamientoId", alojamientoId)

    const res = await fetch("/api/reviews/upload", {
      method: "POST",
      body,
    })

    const json = (await res.json()) as { ok?: boolean; url?: string; error?: string }
    if (!res.ok || !json.ok || !json.url) {
      throw new Error(json.error || "Error al subir una de las fotos.")
    }

    urls.push(json.url)
  }

  return urls
}
