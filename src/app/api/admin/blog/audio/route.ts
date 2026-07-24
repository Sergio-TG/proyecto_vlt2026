import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { getServerSupabase } from "@/lib/supabase-server"
import {
  PODCASTS_BUCKET,
  resolveAudioContentType,
  validateAudioFile,
} from "@/lib/blog-media.config"

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-")
  return base.length > 0 ? base.slice(0, 120) : "audio.mp3"
}

/** Sube un audio/podcast al bucket `podcasts` con service_role (bypass RLS). */
export async function POST(req: Request) {
  try {
    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const slug = String(formData.get("slug") ?? "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Archivo requerido." }, { status: 400 })
    }

    const validationError = validateAudioFile(file)
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 })
    }

    const safeSlug =
      String(slug || "borrador")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "borrador"

    const path = `${safeSlug}/${Date.now()}-${sanitizeFileName(file.name)}`
    const contentType = resolveAudioContentType(file)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from(PODCASTS_BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Error al subir el audio." },
        { status: 400 },
      )
    }

    const { data } = supabase.storage.from(PODCASTS_BUCKET).getPublicUrl(path)
    const url = data?.publicUrl?.trim()
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Supabase Storage no devolvió la URL pública del audio." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, url, path })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al subir el audio."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}

/** Elimina un audio del bucket a partir de su URL pública (admin-only). */
export async function DELETE(req: Request) {
  try {
    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const supabase = getServerSupabase()
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as { url?: string } | null
    const url = String(body?.url || "").trim()
    if (!url) {
      return NextResponse.json({ ok: false, error: "url requerida" }, { status: 400 })
    }

    const marker = `/storage/v1/object/public/${PODCASTS_BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) {
      return NextResponse.json({ ok: true })
    }

    const path = decodeURIComponent(url.slice(idx + marker.length))
    if (!path) {
      return NextResponse.json({ ok: true })
    }

    await supabase.storage.from(PODCASTS_BUCKET).remove([path])
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al eliminar el audio."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
