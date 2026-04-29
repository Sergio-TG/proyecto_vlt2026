"use client"

import * as React from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Lock, Mail, Link as LinkIcon, ArrowLeft } from "lucide-react"

type InviteResponse = { ok?: boolean; url?: string; error?: string; reason?: string }

export default function AdminInvitarPage() {
  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)

  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false

    async function verify() {
      setAuthLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        if (!ignore) {
          setIsAdmin(false)
          setAuthLoading(false)
        }
        return
      }

      const res = await fetch("/api/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)

      const json = (await res?.json().catch(() => null)) as unknown
      const ok = Boolean(res?.ok) && Boolean((json as { ok?: boolean } | null)?.ok)

      if (!ignore) {
        setIsAdmin(ok)
        setAuthLoading(false)
      }
    }

    verify()
    return () => {
      ignore = true
    }
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setInviteUrl(null)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión.")
      }

      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      })

      const json = (await res.json().catch(() => null)) as InviteResponse | null
      if (!res.ok || !json?.ok || !json.url) {
        const msg = json?.error || json?.reason || "No se pudo generar la invitación."
        throw new Error(msg)
      }

      setInviteUrl(json.url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al invitar"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

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
              Necesitás iniciar sesión como Admin para invitar usuarios.
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
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Invitar Admin</h1>
            <p className="text-slate-500 font-medium">Generá un link de invitación para un nuevo administrador.</p>
          </div>
          <Link href="/admin" className="flex-shrink-0">
            <Button variant="outline" className="bg-white font-bold gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 bg-white overflow-hidden max-w-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900 font-black">Nueva invitación</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Ingresá el email del nuevo admin y copiá el link generado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-bold uppercase tracking-widest">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="admin@ejemplo.com"
                    className="h-12 pl-10 bg-white border-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl"
              >
                {submitting ? "Generando..." : "Generar invitación"}
              </Button>
            </form>

            {inviteUrl && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-black">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  Link generado
                </div>
                <div className="break-all font-mono text-xs text-slate-700">{inviteUrl}</div>
                <a
                  href={inviteUrl}
                  className="text-primary font-bold text-sm hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir link
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

