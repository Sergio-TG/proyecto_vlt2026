"use server"

import { sortGaleriaFiles } from "@/lib/imagekit.config"
import { slugify } from "@/lib/utils"

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
  return getArchivosAlojamientoWithCandidates(slug)
}

function buildSlugCandidates(slug: string, extraCandidates?: string[]) {
  const baseSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")

  let decodedSlug = baseSlug
  try {
    decodedSlug = decodeURIComponent(baseSlug)
  } catch {
    decodedSlug = baseSlug
  }

  const extras = Array.isArray(extraCandidates)
    ? extraCandidates
        .map((x) => String(x || "").trim())
        .filter(Boolean)
    : []

  const baseCandidates = [
      baseSlug,
      decodedSlug,
      slugify(baseSlug),
      slugify(decodedSlug),
      ...extras,
      ...extras.map((x) => slugify(x)),
  ].filter(Boolean)

  const strippedCandidates = baseCandidates
    .map((candidate) => String(candidate).trim())
    .filter(Boolean)
    .map((candidate) =>
      candidate.replace(
        /^(cabanas?|cabana|hosteria|hostal|hotel|apart(?:-hotel)?|departamentos?|deptos?|complejo|camping|refugio|estancia)-+/i,
        ""
      )
    )
    .filter(Boolean)

  return Array.from(new Set([...baseCandidates, ...strippedCandidates]))
}

export async function getArchivosAlojamientoWithCandidates(slug: string, extraCandidates?: string[]): Promise<string[]> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) return []

  const candidates = buildSlugCandidates(slug, extraCandidates)
  for (const candidate of candidates) {
    const url = new URL("https://api.imagekit.io/v1/files")
    url.searchParams.set("path", `/alojamientos/${candidate}`)
    url.searchParams.set("fileType", "image")

    const res = await fetch(url.toString(), {
      headers: { Authorization: buildAuthHeader(privateKey) },
      next: { revalidate: 3600, tags: ["imagekit", `imagekit:alojamientos:${candidate}`] },
    })

    if (!res.ok) continue

    const data = (await res.json()) as unknown
    if (!Array.isArray(data)) continue

    const names = (data as ImageKitFileItem[])
      .map((it) => (it?.name ? String(it.name) : ""))
      .map((n) => n.trim())
      .filter(Boolean)
      .filter(isImageName)

    const unique = Array.from(new Set(names))
    if (unique.length > 0) {
      return sortGaleriaFiles(unique)
    }
  }

  return []
}

export async function getPortadaAlojamiento(slug: string): Promise<string | null> {
  const archivos = await getArchivosAlojamiento(slug)
  if (archivos.length === 0) return null

  const portada = archivos.find((n) => n.toLowerCase() === "portada.webp")
  if (portada) return portada

  return archivos[0] ?? null
}

export async function getPortadaAlojamientoWithCandidates(slug: string, extraCandidates?: string[]): Promise<string | null> {
  const archivos = await getArchivosAlojamientoWithCandidates(slug, extraCandidates)
  if (archivos.length === 0) return null
  const portada = archivos.find((n) => n.toLowerCase() === "portada.webp")
  return portada ?? archivos[0] ?? null
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

