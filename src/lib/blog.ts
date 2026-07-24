import { supabase } from "@/lib/supabase"
import type { SiteLocale } from "@/contexts/LanguageContext"
import { pagesEs, pagesEn } from "@/i18n/pagesCopy"
import {
  BLOG_CATEGORIES,
  getBlogCategoryBySlug,
  getBlogCategoryLabel,
  resolveBlogCategorySlug,
  type BlogCategorySlug,
} from "@/lib/blog-categories"

export type BlogPostStatus = "draft" | "published" | "archived"

/** Tipo de un ítem de la galería multimedia adicional del post. */
export type BlogGalleryItemType = "image" | "video"

export type BlogGalleryItem = {
  url: string
  type: BlogGalleryItemType
  caption?: string
}

/** Forma usada por las páginas públicas del blog. */
export type BlogPostContent = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  /** Slug canónico de categoría; ausente en posts hardcodeados antiguos hasta que se resuelva. */
  categorySlug?: string
  image: string
  paragraphs: string[]
  /** Opcional: URL del audio/podcast (Supabase Storage) y su título corto. Ausente en posts hardcodeados/legacy. */
  audioUrl?: string
  audioTitle?: string
  /** Opcional: imágenes/videos adicionales, en orden de despliegue. Ausente en posts hardcodeados/legacy. */
  gallery?: BlogGalleryItem[]
}

/** Fila completa para el panel admin. */
export type BlogPostRow = {
  id: string
  slug: string
  title_es: string
  title_en: string
  excerpt_es: string
  excerpt_en: string
  paragraphs_es: string[]
  paragraphs_en: string[]
  category_es: string
  category_en: string
  category_slug: string
  image: string
  audio_url: string
  audio_title: string
  gallery: BlogGalleryItem[]
  status: BlogPostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export type BlogListFilters = {
  search?: string
  category?: string
}

export type BlogCategoryWithCount = {
  slug: BlogCategorySlug
  name: string
  count: number
}

const BLOG_SELECT =
  "id, slug, title_es, title_en, excerpt_es, excerpt_en, paragraphs_es, paragraphs_en, category_es, category_en, category_slug, image, audio_url, audio_title, gallery, status, published_at, created_at, updated_at"

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item ?? "").trim()).filter(Boolean)
}

/** Normaliza el campo `gallery` (jsonb) tolerando filas antiguas sin la columna. */
export function asGalleryItems(value: unknown): BlogGalleryItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const raw = item as Record<string, unknown>
      const url = String(raw.url ?? "").trim()
      if (!url) return null
      const type = String(raw.type ?? "").trim().toLowerCase() === "video" ? "video" : "image"
      const caption = raw.caption == null ? undefined : String(raw.caption).trim() || undefined
      return { url, type, caption } as BlogGalleryItem
    })
    .filter((item): item is BlogGalleryItem => item !== null)
}

function normalizeStatus(value: unknown): BlogPostStatus {
  const s = String(value || "").trim().toLowerCase()
  if (s === "published" || s === "archived" || s === "draft") return s
  return "draft"
}

function resolveRowCategorySlug(row: Record<string, unknown>): string {
  const fromSlug = resolveBlogCategorySlug(String(row.category_slug ?? ""))
  if (fromSlug) return fromSlug
  const fromEs = resolveBlogCategorySlug(String(row.category_es ?? ""))
  if (fromEs) return fromEs
  const fromEn = resolveBlogCategorySlug(String(row.category_en ?? ""))
  return fromEn ?? ""
}

export function normalizeBlogPostRow(row: Record<string, unknown>): BlogPostRow {
  const category_slug = resolveRowCategorySlug(row)
  const catalog = getBlogCategoryBySlug(category_slug)
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? "").trim(),
    title_es: String(row.title_es ?? ""),
    title_en: String(row.title_en ?? ""),
    excerpt_es: String(row.excerpt_es ?? ""),
    excerpt_en: String(row.excerpt_en ?? ""),
    paragraphs_es: asStringArray(row.paragraphs_es),
    paragraphs_en: asStringArray(row.paragraphs_en),
    category_es: catalog?.name_es ?? String(row.category_es ?? ""),
    category_en: catalog?.name_en ?? String(row.category_en ?? ""),
    category_slug,
    image: String(row.image ?? ""),
    audio_url: String(row.audio_url ?? "").trim(),
    audio_title: String(row.audio_title ?? "").trim(),
    gallery: asGalleryItems(row.gallery),
    status: normalizeStatus(row.status),
    published_at: row.published_at == null ? null : String(row.published_at),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

export function formatBlogDate(value: string | null | undefined, locale: SiteLocale): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
    month: "short",
    year: "numeric",
  })
}

export function toBlogPostContent(row: BlogPostRow, locale: SiteLocale): BlogPostContent {
  const isEn = locale === "en"
  const categorySlug = row.category_slug
  const category =
    getBlogCategoryLabel(categorySlug, locale) ||
    (isEn ? row.category_en || row.category_es : row.category_es)

  return {
    slug: row.slug,
    title: isEn ? row.title_en || row.title_es : row.title_es,
    excerpt: isEn ? row.excerpt_en || row.excerpt_es : row.excerpt_es,
    date: formatBlogDate(row.published_at || row.created_at, locale),
    category,
    categorySlug,
    image: row.image,
    paragraphs: isEn
      ? row.paragraphs_en.length > 0
        ? row.paragraphs_en
        : row.paragraphs_es
      : row.paragraphs_es,
    audioUrl: row.audio_url,
    audioTitle: row.audio_title,
    gallery: row.gallery,
  }
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function postMatchesSearch(post: BlogPostContent, search: string): boolean {
  const q = normalizeSearchText(search)
  if (!q) return true
  const haystack = normalizeSearchText(
    [post.title, post.excerpt, post.category, ...(post.paragraphs ?? [])].join("\n"),
  )
  return haystack.includes(q)
}

function applyListFilters(posts: BlogPostContent[], filters?: BlogListFilters): BlogPostContent[] {
  const search = String(filters?.search || "").trim()
  const category = resolveBlogCategorySlug(filters?.category) ?? ""

  return posts.filter((post) => {
    if (category && post.categorySlug !== category) return false
    if (search && !postMatchesSearch(post, search)) return false
    return true
  })
}

export function getFallbackBlogPosts(locale: SiteLocale): BlogPostContent[] {
  const posts = locale === "en" ? pagesEn.blog.posts : pagesEs.blog.posts
  return posts.map((post) => {
    const categorySlug = resolveBlogCategorySlug(post.category) ?? ""
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: getBlogCategoryLabel(categorySlug, locale, post.category),
      categorySlug,
      image: post.image,
      paragraphs: [...post.paragraphs],
      audioUrl: "",
      audioTitle: "",
      gallery: [],
    }
  })
}

/** Posts publicados desde Supabase; si falla o está vacío, usa el hardcode de pagesCopy. */
export async function fetchPublishedBlogPosts(
  locale: SiteLocale,
  filters?: BlogListFilters,
): Promise<BlogPostContent[]> {
  try {
    let query = supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    const categorySlug = resolveBlogCategorySlug(filters?.category)
    if (categorySlug) {
      query = query.eq("category_slug", categorySlug)
    }

    const { data, error } = await query

    if (error || data == null) {
      return applyListFilters(getFallbackBlogPosts(locale), filters)
    }

    if (data.length === 0) {
      // Tabla vacía o sin coincidencias: fallback solo si no hay filtros activos.
      if (filters?.search || filters?.category) return []
      return getFallbackBlogPosts(locale)
    }

    const mapped = data
      .map((row) => toBlogPostContent(normalizeBlogPostRow(row as Record<string, unknown>), locale))
      .filter((post) => Boolean(post.slug))

    // search se aplica en memoria (título, extracto, categoría y párrafos) con
    // normalización de acentos; el volumen del blog es acotado.
    return applyListFilters(mapped, filters)
  } catch {
    return applyListFilters(getFallbackBlogPosts(locale), filters)
  }
}

export async function fetchPublishedBlogPostBySlug(
  slug: string,
  locale: SiteLocale,
): Promise<BlogPostContent | null> {
  const normalized = String(slug || "").trim()
  if (!normalized) return null

  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .eq("slug", normalized)
      .eq("status", "published")
      .maybeSingle()

    if (!error && data) {
      return toBlogPostContent(normalizeBlogPostRow(data as Record<string, unknown>), locale)
    }
  } catch {
    // fallback abajo
  }

  return getFallbackBlogPosts(locale).find((post) => post.slug === normalized) ?? null
}

/** Lista de categorías del catálogo con conteo de posts publicados. */
export async function fetchBlogCategoriesWithCounts(
  locale: SiteLocale,
): Promise<BlogCategoryWithCount[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category_slug, category_es, category_en")
      .eq("status", "published")

    const counts = new Map<string, number>()

    if (!error && data) {
      for (const row of data) {
        const slug =
          resolveBlogCategorySlug(String((row as { category_slug?: string }).category_slug ?? "")) ||
          resolveBlogCategorySlug(String((row as { category_es?: string }).category_es ?? "")) ||
          resolveBlogCategorySlug(String((row as { category_en?: string }).category_en ?? ""))
        if (!slug) continue
        counts.set(slug, (counts.get(slug) ?? 0) + 1)
      }
    } else {
      for (const post of getFallbackBlogPosts(locale)) {
        if (!post.categorySlug) continue
        counts.set(post.categorySlug, (counts.get(post.categorySlug) ?? 0) + 1)
      }
    }

    return BLOG_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      name: locale === "en" ? cat.name_en : cat.name_es,
      count: counts.get(cat.slug) ?? 0,
    }))
  } catch {
    const counts = new Map<string, number>()
    for (const post of getFallbackBlogPosts(locale)) {
      if (!post.categorySlug) continue
      counts.set(post.categorySlug, (counts.get(post.categorySlug) ?? 0) + 1)
    }
    return BLOG_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      name: locale === "en" ? cat.name_en : cat.name_es,
      count: counts.get(cat.slug) ?? 0,
    }))
  }
}

export { BLOG_SELECT }
