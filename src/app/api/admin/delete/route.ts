import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, reason: "missing_env" });
    }

    try {
      await requireAdmin(req);
    } catch (e: unknown) {
      if (e instanceof Response) return e;
      throw e;
    }

    const body = await req.json();
    const approvedId = body?.approvedId as string | undefined;
    const pendingIds = (body?.pendingIds as string[] | undefined) ?? [];

    if (!approvedId) {
      return NextResponse.json({ error: "Invalid approvedId" }, { status: 400 });
    }

    const { error: delApprovedErr } = await supabase
      .from("alojamientos_aprobados")
      .delete()
      .eq("id", approvedId);

    if (delApprovedErr) {
      return NextResponse.json({ error: delApprovedErr.message }, { status: 500 });
    }

    if (pendingIds.length > 0) {
      await supabase.from("alojamientos_pendientes").delete().in("id", pendingIds);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
