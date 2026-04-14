import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = "sergiotg.web@gmail.com";

export async function GET(req: Request) {
  try {
    const supabaseService = getServerSupabase();
    if (!supabaseService) {
      return NextResponse.json({ ok: false, reason: "missing_env" });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
    if (!token) {
      return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseService.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 });
    }

    if ((userData.user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
    }

    const { data: pendientes, error: pendingErr } = await supabaseService
      .from("alojamientos_pendientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (pendingErr) {
      return NextResponse.json({ ok: false, error: pendingErr.message }, { status: 500 });
    }

    const slugs = (pendientes || [])
      .map((p: unknown) => {
        const row = p as { slug?: unknown; nombre_complejo?: unknown };
        const s = typeof row?.slug === "string" ? row.slug.trim() : "";
        if (s) return s;
        const base = String(row?.nombre_complejo || "alojamiento-sin-nombre");
        return base
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-")
          .trim();
      })
      .filter(Boolean);

    const aprobadosBySlug: Record<string, unknown> = {};
    for (let i = 0; i < slugs.length; i += 100) {
      const chunk = slugs.slice(i, i + 100);
      const { data: approvedData, error: approvedErr } = await supabaseService
        .from("alojamientos_aprobados")
        .select("*")
        .in("slug", chunk);

      if (approvedErr) continue;
      for (const row of approvedData || []) {
        const slug = (row as { slug?: unknown })?.slug;
        if (typeof slug === "string" && slug) aprobadosBySlug[slug] = row;
      }
    }

    return NextResponse.json({ ok: true, pendientes: pendientes || [], aprobadosBySlug });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

