"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Key, Lock, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function getSafeNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith("/") || raw.startsWith("//")) return null
  if (raw.startsWith("/login")) return null
  return raw
}

function getSafeOrigin() {
  if (typeof window === "undefined") return ""

  const { protocol, port } = window.location
  let host = window.location.hostname

  if (host === "0.0.0.0" || host === "::" || host === "[::]") {
    host = "localhost"
  }

  const isDefaultPort =
    (protocol === "http:" && port === "80") || (protocol === "https:" && port === "443")
  const portSuffix = port && !isDefaultPort ? `:${port}` : ""
  return `${protocol}//${host}${portSuffix}`
}

async function resolveDefaultRedirect(accessToken: string, userId: string): Promise<string> {
  // Fuente de verdad de admin: admin_users vía API con service role.
  const verifyRes = await fetch("/api/admin/verify", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null)

  if (verifyRes?.ok) {
    const json = (await verifyRes.json().catch(() => null)) as { ok?: boolean } | null
    if (json?.ok) return "/admin"
  }

  // Perfil / rol en admin_users (si RLS lo permite en el cliente).
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("user_id", userId)
    .maybeSingle()

  const role = typeof adminRow?.role === "string" ? adminRow.role.toLowerCase() : ""
  if (adminRow?.active === true || role === "admin") {
    return "/admin"
  }

  if (role === "socio") {
    return "/socios/portal"
  }

  return "/socios/portal"
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = getSafeNextPath(searchParams.get("next"))

  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [checkingSession, setCheckingSession] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const redirectAfterAuth = React.useCallback(
    async (accessToken: string, userId: string) => {
      const destination = nextPath ?? (await resolveDefaultRedirect(accessToken, userId))
      router.replace(destination)
      router.refresh()
    },
    [nextPath, router],
  )

  React.useEffect(() => {
    let cancelled = false

    const checkExistingSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        setCheckingSession(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setCheckingSession(false)
        return
      }

      await redirectAfterAuth(token, user.id)
    }

    void checkExistingSession()
    return () => {
      cancelled = true
    }
  }, [redirectAfterAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSafeOrigin()}/auth/callback?next=/socios/portal`,
          },
        })
        if (signUpError) throw signUpError

        setInfo("Cuenta creada. Revisá tu email para confirmar el registro y luego iniciá sesión.")
        setMode("login")
        setPassword("")
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      if (!data.user) throw new Error("No se pudo obtener el usuario autenticado.")

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error("Sesión inválida o expirada.")

      await redirectAfterAuth(token, data.user.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al autenticar"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-900 px-4 py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),_transparent_55%),linear-gradient(to_bottom,_#0f172a,_#1e293b_45%,_#0f172a)]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Accedé al panel de admin o al portal de socios
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-2 pt-6">
            <CardTitle className="text-center text-xl font-black tracking-tight text-white">
              {mode === "login" ? "Bienvenido" : "Crear cuenta de socio"}
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-white/60">
              {mode === "login"
                ? "Ingresá tu email y contraseña para continuar"
                : "Registrate para gestionar tu alojamiento en Viví las Termas"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-6 pt-2">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {info && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-200">
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="h-12 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/25 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-white/70"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/25 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl text-base font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                    ? "Entrar"
                    : "Registrarme como socio"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login")
                  setError(null)
                  setInfo(null)
                }}
                className="text-sm font-bold text-white/60 transition-colors hover:text-white"
              >
                {mode === "login"
                  ? "¿No tenés cuenta? Registrate gratis"
                  : "¿Ya tenés cuenta? Iniciá sesión"}
              </button>
            </div>

            <p className="text-center text-xs text-white/35">
              <Link href="/" className="underline-offset-4 hover:text-white/60 hover:underline">
                Volver al sitio
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-900 px-4 py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
