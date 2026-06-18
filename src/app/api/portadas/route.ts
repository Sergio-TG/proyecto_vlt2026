import { NextResponse } from "next/server"
import { getAlojamientoPortadaInfo, getPortadasAlojamientos } from "@/lib/imagekit"
import { slugify } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown
    const itemsRaw = (body as { items?: unknown })?.items
    const slugsRaw = (body as { slugs?: unknown })?.slugs
    const items = Array.isArray(itemsRaw)
      ? itemsRaw
          .map((it) => {
            const row = it as { key?: unknown; slug?: unknown; nombre?: unknown }
            const key = String(row?.key || row?.slug || "").trim()
            const slug = String(row?.slug || "").trim()
            const nombre = String(row?.nombre || "").trim()
            return { key, slug, nombre }
          })
          .filter((row) => row.key && row.slug)
      : []
    const slugs = Array.isArray(slugsRaw)
      ? slugsRaw.map((s) => String(s || "").trim()).filter(Boolean)
      : []

    if (items.length === 0 && slugs.length === 0) {
      return NextResponse.json({ portadas: {}, imageKitFolders: {} })
    }

    if (items.length > 0) {
      const limitedItems = items.slice(0, 300)
      const entries = await Promise.all(
        limitedItems.map(async (item) => {
          const info = await getAlojamientoPortadaInfo(item.slug, [slugify(item.nombre)])
          return [item.key, info] as const
        }),
      )

      const portadas = Object.fromEntries(entries.map(([key, info]) => [key, info.file]))
      const imageKitFolders = Object.fromEntries(entries.map(([key, info]) => [key, info.imageKitFolder]))

      return NextResponse.json({ portadas, imageKitFolders })
    }

    const limited = slugs.slice(0, 200)
    const portadas = await getPortadasAlojamientos(limited)
    return NextResponse.json({ portadas, imageKitFolders: {} })
  } catch {
    return NextResponse.json({ portadas: {}, imageKitFolders: {} }, { status: 200 })
  }
}
