import { NextResponse } from "next/server"
import { uploadAvatarToImageKit } from "@/lib/imagekit-upload"
import { getServerSupabase } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabaseService = getServerSupabase()
    if (!supabaseService) {
      return NextResponse.json({ ok: false, error: "Servidor no configurado." }, { status: 500 })
    }

    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : ""
    if (!token) {
      return NextResponse.json({ ok: false, error: "Sesión requerida." }, { status: 401 })
    }

    const { data: userData, error: userErr } = await supabaseService.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: "Sesión inválida." }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Archivo requerido." }, { status: 400 })
    }

    const url = await uploadAvatarToImageKit(file, userData.user.id)
    return NextResponse.json({ ok: true, url })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al subir la imagen."
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
