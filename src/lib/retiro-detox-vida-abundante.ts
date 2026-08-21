import { getResolvedImageKitBase, IK_TRANSFORMS } from "@/lib/imagekit.config"

export const RETIRO_DETOX_SLUG = "retiro-detox-vida-abundante"
export const RETIRO_DETOX_PROVIDER_ID = "centro-vida-abundante"
export const RETIRO_DETOX_IMAGEKIT_FOLDER = "cabana-vida-abundante"

export const AGENCY_WHATSAPP_PHONE = "5493546525404"

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

export const STAFF_IMAGE_FOLDER = "entorno/experiencias/retiro-detox"

/** Archivos en ImageKit, en el mismo orden que `teamMembers`. `null` = solo título. */
export const STAFF_PHOTO_FILES: Array<string | null> = [
  "Licenciada-Nutricion-Belen-Carlino.webp",
  "Personal-Trainer-Emanuel-Carlino.webp",
  "Licenciada-Educacion-Cristina.webp",
  "Licenciado-Comunicacion-Hugo-Carlino.webp",
  null,
  null,
  null,
]

export function buildRetiroHeroImageUrl(fileName: string): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/alojamientos/${RETIRO_DETOX_IMAGEKIT_FOLDER}/${fileName}?${IK_TRANSFORMS.heroPage}`
}

export function buildRetiroStaffImageUrl(fileName: string): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/${STAFF_IMAGE_FOLDER}/${fileName}?tr=w-720,f-auto,q-80`
}

export const LIVING_FOOD_GALLERY_FILES = [
  "alimentacion-verduras-crudas-varias.webp",
  "alimentacion-plato-caldo.webp",
  "postre-moras.webp",
  "postre-frutas-frescas.webp",
] as const

export const SCHEDULE_GALLERY_FILES = [
  "ejercicios-step.webp",
  "ejercicios-varios.webp",
  "ejercicios-bicicletas-fijas.webp",
  "ejercicios-estiramientos.webp",
  "hidroterapia.webp",
  "masajista.webp",
] as const

export function buildRetiroGalleryImageUrl(fileName: string): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/${STAFF_IMAGE_FOLDER}/${fileName}?tr=w-800,f-auto,q-80`
}

export const RETIRO_TESTIMONIAL_PHOTOS = [
  {
    src: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/retiro-detox/testimonio-susy-battilana.webp",
    updatedAt: null as string | null,
  },
  {
    src: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/retiro-detox/testimonio-miriam-pereyra.webp",
    updatedAt: "1786667028998",
  },
  {
    src: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/retiro-detox/testimonio-andrea-ventancor.webp",
    updatedAt: "1786667070528",
  },
] as const

export function getRetiroPdfUrl(): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "")
  return `${base}/${RETIRO_DETOX_PDF_PATH}`
}

export function waMeHref(phone: string, text: string): string {
  const clean = phone.replace(/[^\d]/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
}
