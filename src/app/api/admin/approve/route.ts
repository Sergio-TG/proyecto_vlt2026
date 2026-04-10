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
    const payloadInput = body?.payload as Record<string, unknown>;
    const pendingId = body?.pendingId as string | undefined;
    if (!payloadInput || typeof payloadInput.slug !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { ...payloadInput };

    const saveWithColumnFallback = async () => {
      for (let i = 0; i < 8; i++) {
        const { data: existing, error: selErr } = await supabase
          .from("alojamientos_aprobados")
          .select("id, slug")
          .eq("slug", payload.slug as string)
          .limit(1);

        if (selErr) {
          return { ok: false, error: selErr };
        }

        const isUpdate = existing && existing.length > 0;
        const { error: upErr } = isUpdate
          ? await supabase.from("alojamientos_aprobados").update(payload).eq("slug", payload.slug as string)
          : await supabase.from("alojamientos_aprobados").insert([payload]);

        if (!upErr) return { ok: true, error: null };

        const msg = upErr.message || "";
        const match = msg.match(/Could not find the '([^']+)' column/i);
        if (match) {
          const missingKey = match[1];
          if (missingKey in payload) {
            delete payload[missingKey];
            continue;
          }
        }

        return { ok: false, error: upErr };
      }
      return { ok: false, error: { message: "Failed saving after column fallback" } as any };
    };

    const saveRes = await saveWithColumnFallback();
    if (!saveRes.ok) {
      const err = saveRes.error as any;
      return NextResponse.json(
        { ok: false, error: err?.message || "Error saving", details: err?.details, hint: err?.hint, code: err?.code },
        { status: 500 }
      );
    }

    if (pendingId) {
      const { data: pendingRow } = await supabase
        .from("alojamientos_pendientes")
        .select("id, slug")
        .eq("id", pendingId)
        .limit(1);

      const pendingSlug =
        pendingRow && pendingRow.length > 0 && pendingRow[0]?.slug
          ? String(pendingRow[0].slug)
          : null;

      if (pendingSlug) {
        await supabase.from("alojamientos_pendientes").delete().eq("slug", pendingSlug);
      } else {
        await supabase.from("alojamientos_pendientes").delete().eq("id", pendingId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
