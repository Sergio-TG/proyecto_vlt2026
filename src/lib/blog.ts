import { supabase } from "@/lib/supabase"
import type { SiteLocale } from "@/contexts/LanguageContext"
import { pagesEs, pagesEn } from "@/i18n/pagesCopy"

export type BlogPostStatus = "draft" | "published" | "archived"

/** Forma usada por las páginas públicas del blog. */
export type BlogPostContent = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
  paragraphs: string[]
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
  image: string
  status: BlogPostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

const BLOG_SELECT =
  "id, slug, title_es, title_en, excerpt_es, excerpt_en, paragraphs_es, paragraphs_en, category_es, category_en, image, status, published_at, created_at, updated_at"

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item ?? "").trim()).filter(Boolean)
}

function normalizeStatus(value: unknown): BlogPostStatus {
  const s = String(value || "").trim().toLowerCase()
  if (s === "published" || s === "archived" || s === "draft") return s
  return "draft"
}

export function normalizeBlogPostRow(row: Record<string, unknown>): BlogPostRow {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? "").trim(),
    title_es: String(row.title_es ?? ""),
    title_en: String(row.title_en ?? ""),
    excerpt_es: String(row.excerpt_es ?? ""),
    excerpt_en: String(row.excerpt_en ?? ""),
    paragraphs_es: asStringArray(row.paragraphs_es),
    paragraphs_en: asStringArray(row.paragraphs_en),
    category_es: String(row.category_es ?? ""),
    category_en: String(row.category_en ?? ""),
    image: String(row.image ?? ""),
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
  return {
    slug: row.slug,
    title: isEn ? row.title_en || row.title_es : row.title_es,
    excerpt: isEn ? row.excerpt_en || row.excerpt_es : row.excerpt_es,
    date: formatBlogDate(row.published_at || row.created_at, locale),
    category: isEn ? row.category_en || row.category_es : row.category_es,
    image: row.image,
    paragraphs: isEn
      ? row.paragraphs_en.length > 0
        ? row.paragraphs_en
        : row.paragraphs_es
      : row.paragraphs_es,
  }
}

export function getFallbackBlogPosts(locale: SiteLocale): BlogPostContent[] {
  const posts = locale === "en" ? pagesEn.blog.posts : pagesEs.blog.posts
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    image: post.image,
    paragraphs: [...post.paragraphs],
  }))
}

/** Posts publicados desde Supabase; si falla o está vacío, usa el hardcode de pagesCopy. */
export async function fetchPublishedBlogPosts(locale: SiteLocale): Promise<BlogPostContent[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return getFallbackBlogPosts(locale)
    }

    return data
      .map((row) => toBlogPostContent(normalizeBlogPostRow(row as Record<string, unknown>), locale))
      .filter((post) => Boolean(post.slug))
  } catch {
    return getFallbackBlogPosts(locale)
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

export { BLOG_SELECT }
