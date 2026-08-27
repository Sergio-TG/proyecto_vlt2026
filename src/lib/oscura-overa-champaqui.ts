import { AGENCY_WHATSAPP_PHONE } from "@/lib/retiro-detox-vida-abundante"

export const CHAMPAQUI_SLUG = "trekking-cerro-champaqui"
export const OSCURA_OVERA_PROVIDER_ID = "oscura-overa"
export const OSCURA_OVERA_WHATSAPP_PHONE = AGENCY_WHATSAPP_PHONE

export const EXCURSION94_FOLDER = "prestadores/oscura-overa/excursion94"
export const FEATURED_IMAGE_URL =
  "https://ik.imagekit.io/vivilastermas/prestadores/oscura-overa/excursion94/cerro-champaqui-panoramica.webp"

/** Archivos de la carpeta que no van en la galería (hero o fotos a excluir). */
export const GALLERY_EXCLUDED_FILES = [
  "cerro-champaqui-panoramica.webp",
  "silla-cerro-champaqui.webp",
] as const
export const FEATURED_EXCURSION_ID = "champaqui-dia-yacanto"
export const UNSURE_EXCURSION_ID = "asesoramiento-general"

export type ExcursionGroupId = "cumbres" | "pueblo" | "circuitos"

export type ExcursionMeta = {
  id: string
  group: ExcursionGroupId
  price: number | null
}

export const EXCURSIONS: ExcursionMeta[] = [
  { id: "champaqui-dia-yacanto", group: "cumbres", price: 94_000 },
  { id: "champaqui-dia-durazno", group: "cumbres", price: 104_000 },
  { id: "champaqui-dia-5km", group: "cumbres", price: 180_000 },
  { id: "amanecer-champaqui", group: "cumbres", price: 94_000 },
  { id: "tres-cumbres", group: "cumbres", price: 280_000 },
  { id: "champaqui-3dias", group: "cumbres", price: 420_000 },
  { id: "linderos-refugio-champaqui", group: "cumbres", price: 340_000 },
  { id: "tres-arboles-refugio-cima", group: "cumbres", price: null },
  { id: "pueblo-escondido", group: "pueblo", price: null },
  { id: "pueblo-escondido-salto-tigre", group: "pueblo", price: 160_000 },
  { id: "cerro-aspero-pueblo", group: "pueblo", price: 260_000 },
  { id: "4x4-durazno-capilla", group: "circuitos", price: 68_000 },
  { id: "tres-cascadas-yacanto", group: "circuitos", price: 38_000 },
  { id: "tres-cascadas-durazno", group: "circuitos", price: 48_000 },
  { id: "avion-caido", group: "circuitos", price: 128_000 },
  { id: "escapate-sierras", group: "circuitos", price: null },
]

export function getExcursionLabels<T extends Record<string, { name: string; detail: string }>>(
  catalog: T,
  id: string,
): T[keyof T] | undefined {
  if (id in catalog) return catalog[id as keyof T]
  return undefined
}

export function waMeHref(phone: string, text: string): string {
  const clean = phone.replace(/[^\d]/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
}
