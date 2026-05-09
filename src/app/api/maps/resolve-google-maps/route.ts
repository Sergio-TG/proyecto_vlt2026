import { NextResponse } from "next/server"
import {
  assertAllowedMapsResolveInput,
  assertResolvedGoogleMapsOutput,
} from "@/lib/google-maps-embed"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get("url")
    if (!raw?.trim()) {
      return NextResponse.json({ error: "missing url" }, { status: 400 })
    }

    assertAllowedMapsResolveInput(raw.trim())

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 12_000)
    const res = await fetch(raw.trim(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VivíLasTermasMapResolver/1.0)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(t))

    const finalUrl = res.url?.trim()
    assertResolvedGoogleMapsOutput(finalUrl)

    return NextResponse.json({ url: finalUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "resolve failed"
    if (msg === "missing" || msg === "invalid") {
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    if (msg === "host not allowed" || msg === "invalid protocol") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "resolve failed" }, { status: 502 })
  }
}
