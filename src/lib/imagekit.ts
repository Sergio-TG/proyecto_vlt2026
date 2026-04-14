"use server"

import { sortGaleriaFiles } from "@/lib/imagekit.config"

type ImageKitFileItem = {
  type?: string
  name?: string
  filePath?: string
  mime?: string
}

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

function isImageName(name: string) {
  const n = name.toLowerCase()
  return n.endsWith(".webp") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png")
}

export async function getArchivosAlojamiento(slug: string): Promise<string[]> {
  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")

  if (!cleanSlug) return []

  const privateKey = getImageKitPrivateKey()
  if (!privateKey) return []

  const url = new URL("https://api.imagekit.io/v1/files")
  url.searchParams.set("path", `/alojamientos/${cleanSlug}`)
  url.searchParams.set("fileType", "image")

  const res = await fetch(url.toString(), {
    headers: { Authorization: buildAuthHeader(privateKey) },
    next: { revalidate: 3600, tags: ["imagekit", `imagekit:alojamientos:${cleanSlug}`] },
  })

  if (!res.ok) return []

  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) return []

  const names = (data as ImageKitFileItem[])
    .map((it) => (it?.name ? String(it.name) : ""))
    .map((n) => n.trim())
    .filter(Boolean)
    .filter(isImageName)

  const unique = Array.from(new Set(names))
  return sortGaleriaFiles(unique)
}

export async function getPortadaAlojamiento(slug: string): Promise<string | null> {
  const archivos = await getArchivosAlojamiento(slug)
  if (archivos.length === 0) return null

  const portada = archivos.find((n) => n.toLowerCase() === "portada.webp")
  if (portada) return portada

  return archivos[0] ?? null
}

export async function getPortadasAlojamientos(slugs: string[]): Promise<Record<string, string | null>> {
  const unique = Array.from(
    new Set((slugs ?? []).map((s) => String(s || "").trim()).filter(Boolean))
  )

  const entries = await Promise.all(
    unique.map(async (slug) => {
      const portada = await getPortadaAlojamiento(slug)
      return [slug, portada] as const
    })
  )

  return Object.fromEntries(entries)
}

