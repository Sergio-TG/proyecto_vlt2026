"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Key, Lock, Mail, ShieldCheck } from "lucide-react"
import { resolvePanelRedirect } from "@/lib/auth-redirect"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const GENERIC_AUTH_ERROR = "Email o contraseña incorrectos."
const GENERIC_MFA_ERROR = "Código incorrecto. Intentá de nuevo."

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = getSafeNextPath(searchParams.get("next"))

  const loginSubtitle = nextPath?.startsWith("/admin")
    ? "Accedé al panel de admin"
    : nextPath?.startsWith("/socios")
      ? "Accedé al portal de socios"
      : "Ingresá con tu cuenta para continuar"

  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [mfaCode, setMfaCode] = React.useState("")
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null)
  const [needsMfa, setNeedsMfa] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [checkingSession, setCheckingSession] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const redirectAfterAuth = React.useCallback(
    async (accessToken: string, userId: string) => {
      const destination = nextPath ?? (await resolvePanelRedirect(accessToken, userId))
      router.replace(destination)
      router.refresh()
    },
    [nextPath, router],
  )

  React.useEffect(() => {
    if (searchParams.get("reset") === "1") {
      setInfo("Tu contraseña se actualizó correctamente. Ya podés iniciar sesión.")
    }
  }, [searchParams])

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

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const totp = factors?.totp?.find((f) => f.status === "verified")
        if (totp) {
          setMfaFactorId(totp.id)
          setNeedsMfa(true)
          setCheckingSession(false)
          return
        }
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

  const completeLogin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("no_user")

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error("no_session")

    await redirectAfterAuth(token, user.id)
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId) return

    const trimmed = mfaCode.replace(/\s/g, "")
    if (!/^\d{6}$/.test(trimmed)) {
      setError(GENERIC_MFA_ERROR)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      })
      if (challengeError || !challenge?.id) throw new Error("mfa")

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: trimmed,
      })
      if (verifyError) throw new Error("mfa")

      await completeLogin()
    } catch {
      setError(GENERIC_MFA_ERROR)
    } finally {
      setLoading(false)
    }
  }

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
        // Anti-enumeración en registro: mensaje genérico de éxito
        if (signUpError) {
          console.error("signUp:", signUpError.message)
        }
        setInfo(
          "Si el email es válido, vas a recibir un correo para confirmar tu cuenta. Después podés iniciar sesión.",
        )
        setMode("login")
        setPassword("")
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError || !data.user) {
        throw new Error("auth")
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const totp = factors?.totp?.find((f) => f.status === "verified")
        if (totp) {
          setMfaFactorId(totp.id)
          setNeedsMfa(true)
          setPassword("")
          return
        }
      }

      await completeLogin()
    } catch {
      setError(GENERIC_AUTH_ERROR)
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
            {needsMfa ? (
              <ShieldCheck className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {needsMfa ? "Verificación en dos pasos" : "Iniciar sesión"}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            {needsMfa
              ? "Ingresá el código de tu app autenticadora"
              : loginSubtitle}
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-2 pt-6">
            <CardTitle className="text-center text-xl font-black tracking-tight text-white">
              {needsMfa
                ? "Código TOTP"
                : mode === "login"
                  ? "Bienvenido"
                  : "Crear cuenta de socio"}
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-white/60">
              {needsMfa
                ? "Google Authenticator, Authy u otra app TOTP"
                : mode === "login"
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

            {needsMfa ? (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="mfa"
                    className="text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    Código de 6 dígitos
                  </Label>
                  <Input
                    id="mfa"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="h-12 rounded-xl border-white/10 bg-white/5 text-center text-lg tracking-[0.35em] font-bold text-white placeholder:text-white/25 focus-visible:ring-primary"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl text-base font-black shadow-xl shadow-primary/20"
                >
                  {loading ? "Verificando..." : "Continuar"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm font-bold text-white/50 hover:text-white"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setNeedsMfa(false)
                    setMfaFactorId(null)
                    setMfaCode("")
                    setError(null)
                  }}
                >
                  Cancelar y volver
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold uppercase tracking-widest text-white/70"
                    >
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
                    {mode === "login" && (
                      <div className="text-right">
                        <Link
                          href="/recuperar-clave"
                          className="text-[11px] font-bold text-white/40 transition-colors hover:text-white"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                    )}
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
              </>
            )}

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
