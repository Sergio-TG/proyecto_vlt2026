"use client"

import * as React from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, Lock, RefreshCcw } from "lucide-react"
import { adminGetAnalytics, type AdminAnalytics } from "@/actions/admin"

function maxCount(items: Array<{ count: number }>) {
  let m = 0
  for (const it of items) m = Math.max(m, it.count)
  return m
}

export default function AdminAnalyticsPage() {
  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<AdminAnalytics | null>(null)

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

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminGetAnalytics(token)
      if (!res.success) throw new Error(res.message)
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las métricas.")
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (isAdmin && token) {
      load()
    }
  }, [isAdmin, token, load])

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
              Necesitás iniciar sesión como Admin para ver analytics.
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

  const topViewed = data?.topViewed ?? []
  const topServices = data?.topServices ?? []
  const maxViewed = maxCount(topViewed)
  const maxService = maxCount(topServices)

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Analytics
            </h1>
            <p className="text-slate-500 font-medium">Métricas internas del sitio.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={load} disabled={loading} className="bg-white font-bold gap-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-slate-200 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900 font-black">Top 5 cabañas más vistas</CardTitle>
              <CardDescription className="font-medium text-slate-500">Basado en page_views.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {topViewed.length === 0 ? (
                <div className="text-slate-500 font-medium">{loading ? "Cargando..." : "Sin datos."}</div>
              ) : (
                <div className="space-y-4">
                  {topViewed.map((it) => {
                    const pct = maxViewed > 0 ? Math.round((it.count / maxViewed) * 100) : 0
                    return (
                      <div key={it.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-black text-slate-900 truncate">{it.key}</div>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold">
                            {it.count}
                          </Badge>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900 font-black">Servicios más consultados</CardTitle>
              <CardDescription className="font-medium text-slate-500">Basado en service_interests.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {topServices.length === 0 ? (
                <div className="text-slate-500 font-medium">{loading ? "Cargando..." : "Sin datos."}</div>
              ) : (
                <div className="space-y-3">
                  {topServices.map((it) => {
                    const pct = maxService > 0 ? Math.round((it.count / maxService) * 100) : 0
                    return (
                      <div key={it.key} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-bold text-slate-800 truncate">{it.key}</div>
                            <div className="text-sm font-black text-slate-900">{it.count}</div>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                            <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

