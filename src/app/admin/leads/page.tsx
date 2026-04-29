"use client"

import * as React from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Lock, RefreshCcw } from "lucide-react"
import { adminListLeads, adminUpdateLead, type LeadRow, type LeadStatus } from "@/actions/admin"

const STATUS_LABEL: Record<LeadStatus, string> = {
  pendiente: "Pendiente",
  "en_gestión": "En gestión",
  reservado: "Reservado",
}

function formatDate(value: string | null | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
}

export default function AdminLeadsPage() {
  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [leads, setLeads] = React.useState<LeadRow[]>([])
  const [savingId, setSavingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false

    async function verify() {
      setAuthLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token || null
      if (!accessToken) {
        if (!ignore) {
          setIsAdmin(false)
          setToken(null)
          setAuthLoading(false)
        }
        return
      }

      const res = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => null)

      const json = (await res?.json().catch(() => null)) as unknown
      const ok = Boolean(res?.ok) && Boolean((json as { ok?: boolean } | null)?.ok)

      if (!ignore) {
        setIsAdmin(ok)
        setToken(ok ? accessToken : null)
        setAuthLoading(false)
      }
    }

    verify()
    return () => {
      ignore = true
    }
  }, [])

  const loadLeads = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminListLeads(token)
      if (!res.success) {
        throw new Error(res.message)
      }
      setLeads(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los leads.")
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (isAdmin && token) {
      loadLeads()
    }
  }, [isAdmin, token, loadLeads])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black text-white tracking-tight">Acceso restringido</CardTitle>
            <CardDescription className="text-white/60 font-medium">
              Necesitás iniciar sesión como Admin para ver los leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin" className="block">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl">
                Ir al panel Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leads</h1>
            <p className="text-slate-500 font-medium">Mensajes del formulario de contacto.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadLeads} disabled={loading} className="bg-white font-bold gap-2">
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Link href="/admin" className="flex-shrink-0">
              <Button variant="outline" className="bg-white font-bold gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-bold">
            {error}
          </div>
        ) : null}

        <Card className="border-slate-200 bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900 font-black">Contact submissions</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Editá el estado y dejá notas internas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Mensaje</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Notas</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-slate-500 font-medium">
                        {loading ? "Cargando..." : "Sin registros."}
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const id = lead.id
                      const statusValue =
                        lead.status === "pendiente" || lead.status === "en_gestión" || lead.status === "reservado"
                          ? (lead.status as LeadStatus)
                          : "pendiente"

                      return (
                        <tr key={id} className="align-top">
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-900">{formatDate(lead.created_at)}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="text-sm font-black text-slate-900">
                                {`${lead.name || ""} ${lead.lastname || ""}`.trim() || "—"}
                              </div>
                              <div className="text-sm text-slate-600">{lead.email || "—"}</div>
                              <div className="text-sm text-slate-600">{lead.phone || "—"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-slate-700 whitespace-pre-wrap break-words max-w-[360px]">
                              {lead.message || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold">
                                {STATUS_LABEL[statusValue]}
                              </Badge>
                              <select
                                className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 px-3 text-sm font-bold text-slate-800"
                                value={statusValue}
                                onChange={(e) => {
                                  const next = e.target.value as LeadStatus
                                  setLeads((prev) =>
                                    prev.map((p) => (p.id === id ? { ...p, status: next } : p))
                                  )
                                }}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_gestión">En gestión</option>
                                <option value="reservado">Reservado</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-5 w-[320px]">
                            <Textarea
                              value={lead.notes || ""}
                              onChange={(e) => {
                                const next = e.target.value
                                setLeads((prev) => prev.map((p) => (p.id === id ? { ...p, notes: next } : p)))
                              }}
                              className="min-h-[90px] bg-slate-50 border-slate-200"
                              placeholder="Notas internas..."
                            />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Button
                                variant="outline"
                                className="bg-white font-black"
                                disabled={!token || savingId === id}
                                onClick={async () => {
                                  if (!token) return
                                  setSavingId(id)
                                  setError(null)
                                  try {
                                    const status = normalizeClientStatus(lead.status)
                                    const notes = typeof lead.notes === "string" ? lead.notes : ""
                                    const res = await adminUpdateLead(token, { id, status, notes })
                                    if (!res.success) throw new Error(res.message)
                                  } catch (e: unknown) {
                                    setError(e instanceof Error ? e.message : "No se pudo guardar.")
                                  } finally {
                                    setSavingId((prev) => (prev === id ? null : prev))
                                  }
                                }}
                              >
                                {savingId === id ? "Guardando..." : "Guardar"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function normalizeClientStatus(value: unknown): LeadStatus {
  if (value === "pendiente" || value === "en_gestión" || value === "reservado") return value
  return "pendiente"
}
