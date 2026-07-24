import type { SiteLocale } from "@/contexts/LanguageContext"
import { slugify } from "@/lib/utils"

export type BlogCategorySlug =
  | "entrevistas-voces-locales"
  | "guias-escapadas"
  | "bienestar-termas"
  | "alojamientos-turismo-responsable"
  | "experiencias-naturaleza"

export type BlogCategoryDefinition = {
  slug: BlogCategorySlug
  name_es: string
  name_en: string
  description_es: string
  description_en: string
}

/** Catálogo canónico de categorías del blog Viví Las Termas. */
export const BLOG_CATEGORIES: readonly BlogCategoryDefinition[] = [
  {
    slug: "entrevistas-voces-locales",
    name_es: "Entrevistas & Voces Locales",
    name_en: "Interviews & Local Voices",
    description_es:
      "Entrevistas a emprendedores, guías locales y dueños de alojamientos. Historias de montaña.",
    description_en:
      "Interviews with entrepreneurs, local guides and hosts. Mountain stories from Calamuchita.",
  },
  {
    slug: "guias-escapadas",
    name_es: "Guías & Escapadas",
    name_en: "Guides & Getaways",
    description_es: "Cómo planificar rutas, temporadas y escapadas por las Sierras de Córdoba.",
    description_en: "How to plan routes, seasons and getaways in the Córdoba Sierras.",
  },
  {
    slug: "bienestar-termas",
    name_es: "Bienestar & Termas",
    name_en: "Wellness & Heated Pools",
    description_es: "Pases, tips y todo lo que necesitás saber para disfrutar Termas del Sol.",
    description_en: "Passes, tips and everything you need to enjoy Termas del Sol.",
  },
  {
    slug: "alojamientos-turismo-responsable",
    name_es: "Alojamientos & Turismo Responsable",
    name_en: "Stays & Responsible Travel",
    description_es: "Por qué elegir alojamientos verificados y viajar con criterio local.",
    description_en: "Why verified stays matter and how to travel with local care.",
  },
  {
    slug: "experiencias-naturaleza",
    name_es: "Experiencias & Naturaleza",
    name_en: "Experiences & Nature",
    description_es: "Senderismo, Champaquí, El Durazno, gastronomía serrana y circuitos al aire libre.",
    description_en: "Hiking, Champaquí, El Durazno, mountain food and outdoor circuits.",
  },
] as const

const BY_SLUG = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.slug, c])) as Record<
  BlogCategorySlug,
  BlogCategoryDefinition
>

/** Labels legacy (ES/EN) → slug canónico, para migrar posts antiguos. */
const LEGACY_LABEL_TO_SLUG: Record<string, BlogCategorySlug> = {
  guias: "guias-escapadas",
  guides: "guias-escapadas",
  "guias-escapadas": "guias-escapadas",
  "guias & escapadas": "guias-escapadas",
  "guides & getaways": "guias-escapadas",
  termas: "bienestar-termas",
  "heated pools": "bienestar-termas",
  "bienestar & termas": "bienestar-termas",
  "wellness & heated pools": "bienestar-termas",
  "turismo responsable": "alojamientos-turismo-responsable",
  "responsible travel": "alojamientos-turismo-responsable",
  "alojamientos & turismo responsable": "alojamientos-turismo-responsable",
  "stays & responsible travel": "alojamientos-turismo-responsable",
  experiencias: "experiencias-naturaleza",
  experiences: "experiencias-naturaleza",
  "experiencias & naturaleza": "experiencias-naturaleza",
  "experiences & nature": "experiencias-naturaleza",
  entrevistas: "entrevistas-voces-locales",
  interviews: "entrevistas-voces-locales",
  "entrevistas & voces locales": "entrevistas-voces-locales",
  "interviews & local voices": "entrevistas-voces-locales",
  "historias de montana": "entrevistas-voces-locales",
  "historias de montaña": "entrevistas-voces-locales",
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return value in BY_SLUG
}

export function getBlogCategoryBySlug(slug: string | null | undefined): BlogCategoryDefinition | null {
  const key = String(slug || "").trim()
  if (!isBlogCategorySlug(key)) return null
  return BY_SLUG[key]
}

export function getBlogCategoryLabel(
  slug: string | null | undefined,
  locale: SiteLocale,
  fallback = "",
): string {
  const cat = getBlogCategoryBySlug(slug)
  if (!cat) return fallback
  return locale === "en" ? cat.name_en : cat.name_es
}

/** Resuelve un slug a partir de texto libre (label, slug parcial o legacy). */
export function resolveBlogCategorySlug(value: string | null | undefined): BlogCategorySlug | null {
  const raw = String(value || "").trim()
  if (!raw) return null
  if (isBlogCategorySlug(raw)) return raw

  const normalized = slugify(raw).replace(/-/g, " ").trim()
  const lower = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if (LEGACY_LABEL_TO_SLUG[lower]) return LEGACY_LABEL_TO_SLUG[lower]
  if (LEGACY_LABEL_TO_SLUG[normalized]) return LEGACY_LABEL_TO_SLUG[normalized]

  // Coincidencia parcial por nombre del catálogo
  for (const cat of BLOG_CATEGORIES) {
    if (cat.slug === raw || cat.slug === slugify(raw)) return cat.slug
    const es = cat.name_es.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const en = cat.name_en.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (lower === es || lower === en) return cat.slug
  }

  return null
}

export function categoryLabelsForSlug(slug: BlogCategorySlug): { category_es: string; category_en: string } {
  const cat = BY_SLUG[slug]
  return { category_es: cat.name_es, category_en: cat.name_en }
}
