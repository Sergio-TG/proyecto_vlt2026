"use client"

import * as React from "react"
import { KeyRound, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ChangePasswordFormProps = {
  /** Variante visual: panel claro (seguridad) o embebida en modal. */
  variant?: "panel" | "embedded"
  onSuccess?: () => void
}

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
    // no bloquea
  }
}

export function ChangePasswordForm({ variant = "panel", onSuccess }: ChangePasswordFormProps) {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

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
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        await notifyPasswordChanged(session.access_token)
      }

      setPassword("")
      setConfirm("")
      setInfo("Tu contraseña se actualizó correctamente. Te enviamos un aviso a tu email.")
      onSuccess?.()
    } catch {
      setError("No se pudo actualizar la contraseña. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {info}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Nueva contraseña
        </Label>
        <Input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm-new-password"
          className="text-xs font-bold uppercase tracking-widest text-slate-500"
        >
          Confirmar nueva contraseña
        </Label>
        <Input
          id="confirm-new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repetí la contraseña"
          disabled={loading}
          className="h-11"
        />
      </div>

      <Button type="submit" disabled={loading} className="h-11 w-full font-bold sm:w-auto sm:px-8">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar contraseña"
        )}
      </Button>
    </form>
  )

  if (variant === "embedded") {
    return (
      <div className="space-y-3 border-t border-slate-200 pt-5">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-900">Cambiar Contraseña</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Ingresá una nueva clave. No hace falta la anterior porque ya estás autenticado.
          </p>
        </div>
        {form}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Cambiar Contraseña</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Definí una nueva contraseña. No pedimos la clave anterior porque ya tenés una sesión
            activa.
          </p>
        </div>
      </div>
      {form}
    </div>
  )
}
