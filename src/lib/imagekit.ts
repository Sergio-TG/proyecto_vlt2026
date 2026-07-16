"use server"

import { sortGaleriaFiles } from "@/lib/imagekit.config"
import { slugify } from "@/lib/utils"

type ImageKitFileItem = {
  type?: string
  name?: string
  filePath?: string
  mime?: string
  updatedAt?: string
}

export type AlojamientoImageKitGaleria = {
  imageKitFolder: string | null
  archivos: string[]
  updatedAtByName: Record<string, string>
}

export type AlojamientoPortadaInfo = {
  file: string | null
  imageKitFolder: string | null
  fileUpdatedAt: string | null
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

function pickPortadaFromArchivos(archivos: string[]): string | null {
  if (archivos.length === 0) return null
  const portada = archivos.find((n) => n.toLowerCase() === "portada.webp")
  return portada ?? archivos[0] ?? null
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
        .map((x) => slugify(String(x || "").trim()))
        .filter(Boolean)
    : []

  const baseCandidates = [
    baseSlug,
    decodedSlug,
    slugify(baseSlug),
    slugify(decodedSlug),
    ...extras,
  ].filter(Boolean)

  const strippedCandidates = baseCandidates
    .map((candidate) => String(candidate).trim())
    .filter(Boolean)
    .map((candidate) =>
      candidate.replace(
        /^(cabanas?|cabana|hosteria|hostal|hotel|apart(?:-hotel)?|departamentos?|deptos?|complejo|camping|refugio|estancia)-+/i,
        "",
      ),
    )
    .filter(Boolean)

  return Array.from(new Set([...baseCandidates, ...strippedCandidates]))
}

async function listImageKitFolder(
  privateKey: string,
  candidate: string,
): Promise<{ names: string[]; updatedAtByName: Record<string, string> }> {
  const url = new URL("https://api.imagekit.io/v1/files")
  url.searchParams.set("path", `/alojamientos/${candidate}`)
  url.searchParams.set("fileType", "image")

  const res = await fetch(url.toString(), {
    headers: { Authorization: buildAuthHeader(privateKey) },
    cache: "no-store",
  })

  if (!res.ok) return { names: [], updatedAtByName: {} }

  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) return { names: [], updatedAtByName: {} }

  const updatedAtByName: Record<string, string> = {}
  const names = (data as ImageKitFileItem[])
    .map((it) => {
      const name = it?.name ? String(it.name).trim() : ""
      if (name && it.updatedAt) {
        updatedAtByName[name] = String(it.updatedAt)
      }
      return name
    })
    .filter(Boolean)
    .filter(isImageName)

  return { names: Array.from(new Set(names)), updatedAtByName }
}

export async function resolveAlojamientoImageKitGaleria(
  slug: string,
  extraCandidates?: string[],
): Promise<AlojamientoImageKitGaleria> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) return { imageKitFolder: null, archivos: [], updatedAtByName: {} }

  const candidates = buildSlugCandidates(slug, extraCandidates)
  for (const candidate of candidates) {
    const { names, updatedAtByName } = await listImageKitFolder(privateKey, candidate)
    if (names.length > 0) {
      return {
        imageKitFolder: candidate,
        archivos: sortGaleriaFiles(names),
        updatedAtByName,
      }
    }
  }

  return { imageKitFolder: null, archivos: [], updatedAtByName: {} }
}

export async function getArchivosAlojamiento(slug: string): Promise<string[]> {
  return getArchivosAlojamientoWithCandidates(slug)
}

export async function getArchivosAlojamientoWithCandidates(slug: string, extraCandidates?: string[]): Promise<string[]> {
  const { archivos } = await resolveAlojamientoImageKitGaleria(slug, extraCandidates)
  return archivos
}

async function listImageKitPath(path: string): Promise<string[]> {
  const privateKey = getImageKitPrivateKey()
  if (!privateKey) return []

  const url = new URL("https://api.imagekit.io/v1/files")
  url.searchParams.set("path", path)
  url.searchParams.set("fileType", "image")

  const res = await fetch(url.toString(), {
    headers: { Authorization: buildAuthHeader(privateKey) },
    cache: "no-store",
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
  if (unique.length === 0) return []

  return sortGaleriaFiles(unique)
}

export async function getArchivosGaleriaTermas(): Promise<string[]> {
  return listImageKitPath("/galeria/termas")
}

/** Lista imágenes de `prestadores/{slug}/`, excluyendo logos. */
export async function getArchivosGaleriaPrestador(slug: string): Promise<string[]> {
  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
  if (!cleanSlug) return []

  const names = await listImageKitPath(`/prestadores/${cleanSlug}`)
  return names.filter((name) => {
    const base = name.toLowerCase().replace(/\.[^.]+$/, "")
    return !base.startsWith("logo")
  })
}

export async function getPortadaAlojamiento(slug: string): Promise<string | null> {
  const archivos = await getArchivosAlojamiento(slug)
  return pickPortadaFromArchivos(archivos)
}

export async function getPortadaAlojamientoWithCandidates(slug: string, extraCandidates?: string[]): Promise<string | null> {
  const { archivos } = await resolveAlojamientoImageKitGaleria(slug, extraCandidates)
  return pickPortadaFromArchivos(archivos)
}

export async function getAlojamientoPortadaInfo(
  slug: string,
  extraCandidates?: string[],
): Promise<AlojamientoPortadaInfo> {
  const { imageKitFolder, archivos, updatedAtByName } = await resolveAlojamientoImageKitGaleria(slug, extraCandidates)
  const file = pickPortadaFromArchivos(archivos)
  const fileUpdatedAt = file ? updatedAtByName[file] ?? null : null
  return { file, imageKitFolder, fileUpdatedAt }
}

export async function getPortadasAlojamientos(slugs: string[]): Promise<Record<string, string | null>> {
  const unique = Array.from(new Set((slugs ?? []).map((s) => String(s || "").trim()).filter(Boolean)))

  const entries = await Promise.all(
    unique.map(async (slug) => {
      const portada = await getPortadaAlojamiento(slug)
      return [slug, portada] as const
    }),
  )

  return Object.fromEntries(entries)
}
