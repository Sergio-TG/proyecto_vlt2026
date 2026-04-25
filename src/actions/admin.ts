"use server"

import { getServerSupabase } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/requireAdmin"

export type LeadStatus = "pendiente" | "en_gestión" | "reservado"

export type LeadRow = {
  id: string
  created_at?: string | null
  name?: string | null
  lastname?: string | null
  email?: string | null
  phone?: string | null
  message?: string | null
  status?: LeadStatus | string | null
  notes?: string | null
}

type ActionResult<T> = { success: true; data: T } | { success: false; message: string }

function buildAdminRequest(token: string) {
  return new Request("http://local/admin-action", {
    headers: { authorization: `Bearer ${token}` },
  })
}

async function assertAdmin(token: string) {
  try {
    await requireAdmin(buildAdminRequest(token))
    return true
  } catch {
    return false
  }
}

function clamp(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value
}

function normalizeStatus(value: unknown): LeadStatus | null {
  if (typeof value !== "string") return null
  if (value === "pendiente" || value === "en_gestión" || value === "reservado") return value
  return null
}

export async function adminListLeads(token: string): Promise<ActionResult<LeadRow[]>> {
  const ok = await assertAdmin(token)
  if (!ok) return { success: false, message: "No autorizado." }

  const supabase = getServerSupabase()
  if (!supabase) return { success: false, message: "Configuración del servidor incompleta." }

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, created_at, name, lastname, email, phone, message, status, notes")
    .order("created_at", { ascending: false })
    .limit(300)

  if (error || !data) return { success: false, message: "No se pudieron cargar los leads." }

  return { success: true, data: data as unknown as LeadRow[] }
}

export async function adminUpdateLead(
  token: string,
  payload: { id: string; status: LeadStatus; notes: string }
): Promise<ActionResult<null>> {
  const ok = await assertAdmin(token)
  if (!ok) return { success: false, message: "No autorizado." }

  const supabase = getServerSupabase()
  if (!supabase) return { success: false, message: "Configuración del servidor incompleta." }

  const id = typeof payload?.id === "string" ? payload.id.trim() : ""
  const status = normalizeStatus(payload?.status)
  const notes = clamp(typeof payload?.notes === "string" ? payload.notes.trim() : "", 2000)

  if (!id || !status) return { success: false, message: "Datos inválidos." }

  const { error } = await supabase
    .from("contact_submissions")
    .update({ status, notes })
    .eq("id", id)

  if (error) return { success: false, message: "No se pudo actualizar el lead." }

  return { success: true, data: null }
}

export type TopCount = { key: string; count: number }

export type AdminAnalytics = {
  topViewed: TopCount[]
  topServices: TopCount[]
}

export async function adminGetAnalytics(token: string): Promise<ActionResult<AdminAnalytics>> {
  const ok = await assertAdmin(token)
  if (!ok) return { success: false, message: "No autorizado." }

  const supabase = getServerSupabase()
  if (!supabase) return { success: false, message: "Configuración del servidor incompleta." }

  const [{ data: views, error: viewsErr }, { data: interests, error: interestsErr }] = await Promise.all([
    supabase.from("page_views").select("slug").order("created_at", { ascending: false }).limit(5000),
    supabase.from("service_interests").select("service").order("created_at", { ascending: false }).limit(5000),
  ])

  if (viewsErr || !views) return { success: false, message: "No se pudieron cargar las métricas de vistas." }
  if (interestsErr || !interests) return { success: false, message: "No se pudieron cargar las métricas de servicios." }

  const viewCounts = new Map<string, number>()
  for (const row of views as unknown as Array<{ slug?: unknown }>) {
    const slug = typeof row?.slug === "string" ? row.slug.trim() : ""
    if (!slug) continue
    viewCounts.set(slug, (viewCounts.get(slug) || 0) + 1)
  }

  const serviceCounts = new Map<string, number>()
  for (const row of interests as unknown as Array<{ service?: unknown }>) {
    const service = typeof row?.service === "string" ? row.service.trim() : ""
    if (!service) continue
    serviceCounts.set(service, (serviceCounts.get(service) || 0) + 1)
  }

  const topViewed = Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }))

  const topServices = Array.from(serviceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([key, count]) => ({ key, count }))

  return { success: true, data: { topViewed, topServices } }
}

