import { NextResponse } from "next/server"
import { fetchBlogCategoriesWithCounts } from "@/lib/blog"
import type { SiteLocale } from "@/contexts/LanguageContext"

function parseLocale(value: string | null): SiteLocale {
  return value === "en" ? "en" : "es"
}

/** GET /api/blog/categories?locale= — categorías del catálogo con conteo de posts publicados. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const locale = parseLocale(searchParams.get("locale"))
    const categories = await fetchBlogCategoriesWithCounts(locale)
    const total = categories.reduce((sum, c) => sum + c.count, 0)
    return NextResponse.json({ ok: true, categories, total })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
