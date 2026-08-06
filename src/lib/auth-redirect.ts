import { supabase } from "@/lib/supabase"

/** Solo rutas relativas internas (anti open-redirect). */
export function getSafeInternalPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback
  return raw
}

/** Destino del panel según rol del usuario autenticado. */
export async function resolvePanelRedirect(accessToken: string, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  const profileRole = typeof profile?.role === "string" ? profile.role.toLowerCase() : ""
  if (profileRole === "admin") return "/admin"
  if (profileRole === "socio") return "/socios/portal"

  const verifyRes = await fetch("/api/admin/verify", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null)

  if (verifyRes?.ok) {
    const json = (await verifyRes.json().catch(() => null)) as { ok?: boolean } | null
    if (json?.ok) return "/admin"
  }

  return "/socios/portal"
}
