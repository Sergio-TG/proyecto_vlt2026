import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"
import { BLOG_SELECT, normalizeBlogPostRow, type BlogPostStatus } from "@/lib/blog"

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

    const body = (await req.json()) as { id?: string; status?: string }
    const id = typeof body.id === "string" ? body.id.trim() : ""
    const statusRaw = String(body.status || "").trim().toLowerCase()
    const status = (
      statusRaw === "draft" || statusRaw === "published" || statusRaw === "archived"
        ? statusRaw
        : null
    ) as BlogPostStatus | null

    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "id y status (draft|published|archived) son requeridos" },
        { status: 400 },
      )
    }

    const patch: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "published") {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", id)
        .maybeSingle()

      if (!existing?.published_at) {
        patch.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(patch)
      .eq("id", id)
      .select(BLOG_SELECT)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "Post no encontrado" }, { status: 404 })
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
