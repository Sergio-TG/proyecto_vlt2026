import { NextResponse } from "next/server"
import { uploadReviewPhotoToImageKit } from "@/lib/imagekit-upload"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const alojamientoId = String(formData.get("alojamientoId") ?? "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Archivo requerido." }, { status: 400 })
    }
    if (!alojamientoId) {
      return NextResponse.json({ ok: false, error: "alojamientoId requerido." }, { status: 400 })
    }

    const url = await uploadReviewPhotoToImageKit(file, alojamientoId)
    return NextResponse.json({ ok: true, url })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al subir la imagen."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
