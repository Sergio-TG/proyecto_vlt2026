import { getResolvedImageKitBase, IK_TRANSFORMS } from "@/lib/imagekit.config"

export const RETIRO_DETOX_SLUG = "retiro-detox-vida-abundante"
export const RETIRO_DETOX_PROVIDER_ID = "centro-vida-abundante"
export const RETIRO_DETOX_IMAGEKIT_FOLDER = "cabana-vida-abundante"

export const AGENCY_WHATSAPP_PHONE = "5493546525404"
/** WhatsApp del prestador (Cabaña / Centro Vida Abundante). */
export const PROVIDER_WHATSAPP_PHONE = "5493546418881"

/** Ruta esperada del PDF en ImageKit (subir el archivo a esta ubicación). */
export const RETIRO_DETOX_PDF_PATH =
  "documentos/experiencias/programa-depuracion-vitalidad.pdf"

export const HERO_IMAGE_FILES = [
  "vista-exterior-lavandas.webp",
  "portada.webp",
  "hidromasaje-002.webp",
  "estar-001.webp",
  "comedor-001.webp",
  "gym-001.webp",
] as const

export type ModalityId =
  | "local-esencial"
  | "local-integral"
  | "local-premium"
  | "residencial-integral"
  | "residencial-premium"

export type ModalityGroup = "local" | "residencial"

export type ModalityMeta = {
  id: ModalityId
  group: ModalityGroup
  price: number
}

export const MODALITIES: ModalityMeta[] = [
  { id: "local-esencial", group: "local", price: 150_000 },
  { id: "local-integral", group: "local", price: 200_000 },
  { id: "local-premium", group: "local", price: 250_000 },
  { id: "residencial-integral", group: "residencial", price: 300_000 },
  { id: "residencial-premium", group: "residencial", price: 350_000 },
]

export function formatArsPrice(value: number): string {
  return `$${value.toLocaleString("es-AR")}`
}

export function buildRetiroHeroImageUrl(fileName: string): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/alojamientos/${RETIRO_DETOX_IMAGEKIT_FOLDER}/${fileName}?${IK_TRANSFORMS.heroPage}`
}

export function getRetiroPdfUrl(): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/${RETIRO_DETOX_PDF_PATH}`
}

export function waMeHref(phone: string, text: string): string {
  const clean = phone.replace(/[^\d]/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
}
