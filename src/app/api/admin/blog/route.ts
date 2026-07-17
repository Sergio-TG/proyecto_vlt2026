import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import {
  BLOG_SELECT,
  normalizeBlogPostRow,
  type BlogPostRow,
  type BlogPostStatus,
} from "@/lib/blog"
import { slugify } from "@/lib/utils"

function parseParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").replace(/\r\n/g, "\n").trim())
      .filter(Boolean)
  }
  if (typeof value === "string") {
    // Doble Enter (línea en blanco) = nuevo párrafo.
    // Enter simple = salto de línea dentro del párrafo (se conserva).
    return value
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .map((block) => block.replace(/^\n+|\n+$/g, "").trim())
      .filter(Boolean)
  }
  return []
}

function parseStatus(value: unknown): BlogPostStatus | null {
  const s = String(value || "").trim().toLowerCase()
  if (s === "draft" || s === "published" || s === "archived") return s
  return null
}

export type BlogPostPayload = {
  id?: string
  slug?: string
  title_es?: string
  title_en?: string
  excerpt_es?: string
  excerpt_en?: string
  paragraphs_es?: unknown
  paragraphs_en?: unknown
  category_es?: string
  category_en?: string
  image?: string
  status?: string
  published_at?: string | null
}

function buildUpsertFromBody(body: BlogPostPayload) {
  const titleEs = String(body.title_es || "").trim()
  if (!titleEs) {
    return { error: "title_es es obligatorio" as const }
  }

  const slugRaw = String(body.slug || "").trim()
  const slug = slugify(slugRaw || titleEs)
  if (!slug) {
    return { error: "slug inválido" as const }
  }

  const status = parseStatus(body.status) || "draft"
  let publishedAt: string | null =
    body.published_at === null || body.published_at === undefined || body.published_at === ""
      ? null
      : String(body.published_at)

  if (status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString()
  }

  return {
    data: {
      slug,
      title_es: titleEs,
      title_en: String(body.title_en || "").trim(),
      excerpt_es: String(body.excerpt_es || "").trim(),
      excerpt_en: String(body.excerpt_en || "").trim(),
      paragraphs_es: parseParagraphs(body.paragraphs_es),
      paragraphs_en: parseParagraphs(body.paragraphs_en),
      category_es: String(body.category_es || "").trim(),
      category_en: String(body.category_en || "").trim(),
      image: String(body.image || "").trim(),
      status,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    },
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select(BLOG_SELECT)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const posts: BlogPostRow[] = (data ?? []).map((row) =>
      normalizeBlogPostRow(row as Record<string, unknown>),
    )

    return NextResponse.json({ ok: true, posts })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const body = (await req.json()) as BlogPostPayload
    const built = buildUpsertFromBody(body)
    if ("error" in built) {
      return NextResponse.json({ ok: false, error: built.error }, { status: 400 })
    }

    const id = typeof body.id === "string" ? body.id.trim() : ""

    if (id) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(built.data)
        .eq("id", id)
        .select(BLOG_SELECT)
        .maybeSingle()

      if (error) {
        const conflict = error.code === "23505"
        return NextResponse.json(
          { ok: false, error: conflict ? "Ya existe un post con ese slug" : error.message },
          { status: conflict ? 409 : 500 },
        )
      }
      if (!data) {
        return NextResponse.json({ ok: false, error: "Post no encontrado" }, { status: 404 })
      }

      return NextResponse.json({
        ok: true,
        post: normalizeBlogPostRow(data as Record<string, unknown>),
      })
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert([built.data])
      .select(BLOG_SELECT)
      .single()

    if (error) {
      const conflict = error.code === "23505"
      return NextResponse.json(
        { ok: false, error: conflict ? "Ya existe un post con ese slug" : error.message },
        { status: conflict ? 409 : 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      post: normalizeBlogPostRow(data as Record<string, unknown>),
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const body = (await req.json()) as { id?: string }
    const id = typeof body.id === "string" ? body.id.trim() : ""
    if (!id) {
      return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 })
    }

    const { error } = await supabase.from("blog_posts").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
