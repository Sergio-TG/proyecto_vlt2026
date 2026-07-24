import { NextResponse } from "next/server"
import {
  fetchBlogCategoriesWithCounts,
  fetchPublishedBlogPosts,
  type BlogListFilters,
} from "@/lib/blog"
import type { SiteLocale } from "@/contexts/LanguageContext"

function parseLocale(value: string | null): SiteLocale {
  return value === "en" ? "en" : "es"
}

/** GET /api/blog?search=&category=&locale= — listado público filtrable. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filters: BlogListFilters = {
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    }
    const locale = parseLocale(searchParams.get("locale"))

    const posts = await fetchPublishedBlogPosts(locale, filters)
    return NextResponse.json({ ok: true, posts, filters })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
