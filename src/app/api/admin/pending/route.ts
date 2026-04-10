import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = "sergiotg.web@gmail.com";

export async function GET(req: Request) {
  try {
    const supabaseService = getServerSupabase();
    if (!supabaseService) {
      return NextResponse.json({ ok: false, reason: "missing_env" });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    if (!url || !anonKey) {
      return NextResponse.json({ ok: false, reason: "missing_public_env" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
    if (!token) {
      return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 401 });
    }

    const supabaseAuth = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
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
      .map((p: any) => {
        const s = typeof p?.slug === "string" ? p.slug.trim() : "";
        if (s) return s;
        const base = String(p?.nombre_complejo || "alojamiento-sin-nombre");
        return base
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-")
          .trim();
      })
      .filter(Boolean);

    const aprobadosBySlug: Record<string, any> = {};
    for (let i = 0; i < slugs.length; i += 100) {
      const chunk = slugs.slice(i, i + 100);
      const { data: approvedData, error: approvedErr } = await supabaseService
        .from("alojamientos_aprobados")
        .select("*")
        .in("slug", chunk);

      if (approvedErr) continue;
      for (const row of approvedData || []) {
        if (row?.slug) aprobadosBySlug[row.slug] = row;
      }
    }

    return NextResponse.json({ ok: true, pendientes: pendientes || [], aprobadosBySlug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

