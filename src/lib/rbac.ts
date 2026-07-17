/**
 * RBAC a nivel Server Components.
 * Políticas RLS complementarias: ver `db/profiles_and_rls.sql`.
 */
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createAuthServerClient } from "@/lib/supabase-auth-server"
import { getServerSupabase } from "@/lib/supabase-server"

export type AppRole = "admin" | "socio"

export type AuthWithRole = {
  user: User
  role: AppRole
}

function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null
  const role = value.trim().toLowerCase()
  if (role === "admin" || role === "socio") return role
  return null
}

/**
 * Resuelve el rol del usuario autenticado.
 * 1) Tabla `profiles` (fuente preferida de RBAC)
 * 2) Fallback a `admin_users` vía service role
 * 3) Usuario autenticado sin admin → `socio` (compatibilidad con socios existentes)
 */
export async function getAuthWithRole(): Promise<AuthWithRole | null> {
  const supabase = await createAuthServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profileError) {
    const fromProfile = normalizeRole(profile?.role)
    if (fromProfile) {
      return { user, role: fromProfile }
    }
  }

  const adminClient = getServerSupabase()
  if (adminClient) {
    const { data: adminRow } = await adminClient
      .from("admin_users")
      .select("active, role")
      .eq("user_id", user.id)
      .maybeSingle()

    if (adminRow?.active === true) {
      return { user, role: "admin" }
    }
  }

  return { user, role: "socio" }
}

/** Panel Admin: solo rol `admin`. */
export async function requireAdminRole(): Promise<AuthWithRole> {
  const auth = await getAuthWithRole()
  if (!auth) {
    redirect("/login?next=/admin")
  }
  if (auth.role !== "admin") {
    redirect("/no-autorizado")
  }
  return auth
}

/** Portal Socios: roles `socio` o `admin`. */
export async function requireSocioOrAdminRole(): Promise<AuthWithRole> {
  const auth = await getAuthWithRole()
  if (!auth) {
    redirect("/login?next=/socios/portal")
  }
  if (auth.role !== "socio" && auth.role !== "admin") {
    redirect("/no-autorizado")
  }
  return auth
}
