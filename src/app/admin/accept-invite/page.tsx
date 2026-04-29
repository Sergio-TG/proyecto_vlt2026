"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Lock, Key, ArrowLeft, CheckCircle2 } from "lucide-react"

type AcceptResponse = { ok?: boolean; error?: string; reason?: string }

export default function AdminAcceptInvitePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
          <div className="text-slate-500 font-medium">Cargando...</div>
        </div>
      }
    >
      <AdminAcceptInviteInner />
    </React.Suspense>
  )
}

function AdminAcceptInviteInner() {
  const searchParams = useSearchParams()
  const token = (searchParams.get("token") || "").trim()
  const email = (searchParams.get("email") || "").trim()

  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isValidPassword = password.trim().length >= 8
  const matches = password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token || !email) {
      setError("Falta información de la invitación. Volvé a abrir el link de invitación.")
      return
    }
    if (!isValidPassword) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (!matches) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const json = (await res.json().catch(() => null)) as AcceptResponse | null
      if (!res.ok || !json?.ok) {
        const msg = json?.error || json?.reason || "No se pudo completar el registro."
        throw new Error(msg)
      }

      setDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al completar el registro"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black text-white tracking-tight">Invitación inválida</CardTitle>
            <CardDescription className="text-white/60 font-medium">
              Falta el token o el email. Volvé a abrir el link de invitación.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/" className="block">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="bg-green-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-black text-white tracking-tight">Registro completo</CardTitle>
            <CardDescription className="text-white/60 font-medium">
              Ya podés iniciar sesión en el panel Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Link href="/admin" className="block">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl">
                Ir al login de Admin
              </Button>
            </Link>
            <div className="text-center text-[11px] text-white/40 font-medium">{email}</div>
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Aceptar invitación</h1>
            <p className="text-slate-500 font-medium">Elegí una contraseña para completar tu alta como Admin.</p>
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
            <CardTitle className="text-slate-900 font-black">Completar registro</CardTitle>
            <CardDescription className="font-medium text-slate-500">{email}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-bold uppercase tracking-widest">Contraseña</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-12 pl-10 bg-white border-slate-200"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Mínimo 8 caracteres.</div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 text-xs font-bold uppercase tracking-widest">Confirmar contraseña</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-12 pl-10 bg-white border-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl"
              >
                {submitting ? "Creando..." : "Completar registro"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

