import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 500 });
    }

    try {
      await requireAdmin(req);
    } catch (e: unknown) {
      if (e instanceof Response) return e;
      throw e;
    }

    const body = await req.json();
    const pendingIds = (body?.pendingIds as string[] | undefined) ?? [];

    if (!pendingIds || pendingIds.length === 0) {
      return NextResponse.json({ error: "Invalid pendingIds" }, { status: 400 });
    }

    const { error: delErr } = await supabase
      .from("alojamientos_pendientes")
      .delete()
      .in("id", pendingIds);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
