import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { uploadBlogGalleryFileToImageKit } from "@/lib/imagekit-upload"
import { MAX_GALLERY_ITEMS } from "@/lib/blog-media.config"
import type { BlogGalleryItem } from "@/lib/blog"

/** Sube uno o varios archivos de galería (imagen/video) para el editor de blog. */
export async function POST(req: Request) {
  try {
    try {
      await requireAdmin(req)
    } catch (e: unknown) {
      if (e instanceof Response) return e
      throw e
    }

    const formData = await req.formData()
    const slug = String(formData.get("slug") ?? "").trim()
    const files = formData.getAll("files").filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "No se recibió ningún archivo." }, { status: 400 })
    }
    if (files.length > MAX_GALLERY_ITEMS) {
      return NextResponse.json(
        { ok: false, error: `Podés subir como máximo ${MAX_GALLERY_ITEMS} archivos a la vez.` },
        { status: 400 },
      )
    }

    const items: BlogGalleryItem[] = []
    for (const file of files) {
      const item = await uploadBlogGalleryFileToImageKit(file, slug)
      items.push(item)
    }

    return NextResponse.json({ ok: true, items })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al subir los archivos."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
