"use client"

import { validateAudioFile } from "@/lib/blog-media.config"

/**
 * Sube un archivo de audio vía API admin (service_role en servidor).
 * Evita fallos de RLS del cliente al insertar en el bucket `podcasts`.
 */
export async function uploadPodcastAudio(
  file: File,
  slug: string,
  token: string,
): Promise<string> {
  const validationError = validateAudioFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const body = new FormData()
  body.append("file", file)
  body.append("slug", slug)

  const res = await fetch("/api/admin/blog/audio", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  })

  const json = (await res.json().catch(() => null)) as {
    ok?: boolean
    url?: string
    error?: string
    reason?: string
  } | null

  if (json?.reason === "missing_env") {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
  }
  if (!res.ok || !json?.ok || !json.url) {
    throw new Error(json?.error || "Error al subir el audio a Supabase Storage.")
  }

  return json.url
}

/** Intenta borrar un audio del bucket a partir de su URL pública (best-effort). */
export async function deletePodcastAudioByUrl(url: string, token: string): Promise<void> {
  if (!url || !token) return
  await fetch("/api/admin/blog/audio", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  }).catch(() => null)
}
