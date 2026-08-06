"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, CheckCircle2, Key, Lock } from "lucide-react"
import { resolvePanelRedirect } from "@/lib/auth-redirect"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function notifyPasswordChanged(accessToken: string) {
  try {
    await fetch("/api/auth/password-changed", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
  } catch {
    // El cambio de clave ya fue exitoso; el aviso por email no debe bloquear.
  }
}

function ActualizarClaveForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ready, setReady] = React.useState(false)
  const [checking, setChecking] = React.useState(true)
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (searchParams.get("error") === "recovery-failed") {
      setError("El enlace de recuperación no es válido o expiró. Solicitá uno nuevo.")
      setChecking(false)
      setReady(false)
    }
  }, [searchParams])

  React.useEffect(() => {
    let cancelled = false

    // PKCE: si el correo dejó un ?code= en esta ruta, intercambiar vía callback.
    const code = searchParams.get("code")
    if (code) {
      const params = new URLSearchParams({
        code,
        next: "/actualizar-clave",
        type: "recovery",
      })
      window.location.replace(`/auth/callback?${params.toString()}`)
      return
    }

    const markReady = () => {
      if (!cancelled) {
        setReady(true)
        setChecking(false)
        setError(null)
      }
    }

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (session) {
        markReady()
      } else {
        setChecking(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        markReady()
        return
      }
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        markReady()
      }
    })

    void init()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      const { data: userData, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      const userId = userData.user?.id || session?.user?.id

      if (token) {
        await notifyPasswordChanged(token)
      }

      setSuccess(true)

      if (token && userId) {
        const destination = await resolvePanelRedirect(token, userId)
        const sep = destination.includes("?") ? "&" : "?"
        router.replace(`${destination}${sep}password_updated=1`)
        router.refresh()
        return
      }

      router.replace("/login?reset=1")
      router.refresh()
    } catch {
      setError("No se pudo actualizar la contraseña. Solicitá un nuevo enlace de recuperación.")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
          <h1 className="text-3xl font-black tracking-tight text-white">Nueva contraseña</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Elegí una clave segura para tu cuenta
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-2 pt-6">
            <CardTitle className="text-center text-xl font-black tracking-tight text-white">
              Actualizar clave
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-white/60">
              {ready
                ? "Ingresá y confirmá tu nueva contraseña"
                : "El enlace de recuperación no es válido o expiró"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-6 pt-2">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-200">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Contraseña actualizada. Redirigiendo a tu panel...
              </div>
            )}

            {!ready ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-white/50">
                  Pedí un nuevo enlace desde la página de recuperación.
                </p>
                <Button asChild className="h-12 w-full rounded-xl font-black" disabled={loading}>
                  <Link href="/recuperar-clave">Solicitar nuevo enlace</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      disabled={loading || success}
                      className="h-12 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/25 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm"
                    className="text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input
                      id="confirm"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repetí la contraseña"
                      disabled={loading || success}
                      className="h-12 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/25 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || success}
                  className="h-12 w-full rounded-xl text-base font-black shadow-xl shadow-primary/20"
                >
                  {loading ? "Guardando..." : success ? "Listo" : "Guardar nueva contraseña"}
                </Button>
              </form>
            )}

            <p className="text-center text-xs text-white/35">
              <Link href="/login" className="underline-offset-4 hover:text-white/60 hover:underline">
                Volver al login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ActualizarClavePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-900 px-4 py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <ActualizarClaveForm />
    </React.Suspense>
  )
}
