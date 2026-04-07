import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "missing_env" });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" });
    }
    const body = await req.json();
    const payload = body?.payload as Record<string, unknown>;
    const pendingId = body?.pendingId as string | undefined;
    if (!payload || typeof payload.slug !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: existing, error: selErr } = await supabase
      .from("alojamientos_aprobados")
      .select("id, slug")
      .eq("slug", payload.slug)
      .limit(1);
    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    let upErr: any | null = null;
    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("alojamientos_aprobados")
        .update(payload)
        .eq("slug", payload.slug);
      upErr = error;
    } else {
      const { error } = await supabase
        .from("alojamientos_aprobados")
        .insert([payload]);
      upErr = error;
    }

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
