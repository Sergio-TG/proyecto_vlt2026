import { NextResponse } from "next/server"
import { getPortadasAlojamientos } from "@/lib/imagekit"

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown
    const slugsRaw = (body as { slugs?: unknown })?.slugs
    const slugs = Array.isArray(slugsRaw)
      ? slugsRaw.map((s) => String(s || "").trim()).filter(Boolean)
      : []

    if (slugs.length === 0) {
      return NextResponse.json({ portadas: {} })
    }

    const limited = slugs.slice(0, 200)
    const portadas = await getPortadasAlojamientos(limited)
    return NextResponse.json({ portadas })
  } catch {
    return NextResponse.json({ portadas: {} }, { status: 200 })
  }
}

