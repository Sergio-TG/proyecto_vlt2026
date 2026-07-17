"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SUCCESS_MESSAGE =
  "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña. Revisá tu casilla (y spam)."

export default function RecuperarClavePage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/actualizar-clave`,
      })
      // Anti-enumeración: no revelar si el email existe.
      if (resetError) {
        console.error("resetPasswordForEmail:", resetError.message)
      }
      setSent(true)
    } catch (err) {
      console.error(err)
      setError("No pudimos procesar la solicitud. Intentá de nuevo en unos minutos.")
    } finally {
      setLoading(false)
    }
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
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Recuperar contraseña</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Te enviamos un enlace seguro a tu email
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-2 pt-6">
            <CardTitle className="text-center text-xl font-black tracking-tight text-white">
              ¿Olvidaste tu clave?
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium text-white/60">
              Ingresá el email de tu cuenta de socio o admin
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 p-6 pt-2">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {sent ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-200">
                  {SUCCESS_MESSAGE}
                </div>
                <Button asChild className="h-12 w-full rounded-xl font-black">
                  <Link href="/login">Volver al login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input
                      id="email"
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl text-base font-black shadow-xl shadow-primary/20"
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            )}

            <p className="text-center text-xs text-white/35">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 underline-offset-4 hover:text-white/60 hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver al login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
