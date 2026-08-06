"use client"

import * as React from "react"
import { CheckCircle2, Copy, Loader2, ShieldCheck, ShieldOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type VerifiedFactor = {
  id: string
  friendly_name?: string | null
}

type EnrollDraft = {
  factorId: string
  qrCode: string | null
  secret: string | null
}

type MfaSetupPanelProps = {
  /** Si true, muestra aviso de recomendación fuerte (admins). */
  emphasize?: boolean
}

export function MfaSetupPanel({ emphasize = false }: MfaSetupPanelProps) {
  const [loading, setLoading] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [factors, setFactors] = React.useState<VerifiedFactor[]>([])
  const [enroll, setEnroll] = React.useState<EnrollDraft | null>(null)
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const refreshFactors = React.useCallback(async () => {
    const { data, error: listError } = await supabase.auth.mfa.listFactors()
    if (listError) {
      console.error("mfa.listFactors:", listError.message)
      setFactors([])
      return
    }
    const verified = (data?.totp ?? []).filter((f) => f.status === "verified")
    setFactors(
      verified.map((f) => ({
        id: f.id,
        friendly_name: f.friendly_name,
      })),
    )
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await refreshFactors()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshFactors])

  const handleStartEnroll = async () => {
    setBusy(true)
    setError(null)
    setInfo(null)
    setCode("")
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
      })
      if (enrollError) throw enrollError
      if (!data?.id) throw new Error("No se pudo iniciar el enrolamiento MFA.")

      setEnroll({
        factorId: data.id,
        qrCode: data.totp?.qr_code ?? null,
        secret: data.totp?.secret ?? null,
      })
    } catch {
      setError("No se pudo iniciar la verificación en dos pasos. Intentá de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enroll) return

    const trimmed = code.replace(/\s/g, "")
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Ingresá el código de 6 dígitos de tu app autenticadora.")
      return
    }

    setBusy(true)
    setError(null)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enroll.factorId,
      })
      if (challengeError) throw challengeError
      if (!challenge?.id) throw new Error("Challenge inválido.")

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enroll.factorId,
        challengeId: challenge.id,
        code: trimmed,
      })
      if (verifyError) throw verifyError

      setEnroll(null)
      setCode("")
      setInfo("Verificación en dos pasos activada correctamente.")
      await refreshFactors()
    } catch {
      setError("Código incorrecto o expirado. Probá con el código actual de la app.")
    } finally {
      setBusy(false)
    }
  }

  const handleUnenroll = async (factorId: string) => {
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId })
      if (unenrollError) throw unenrollError
      setInfo("La verificación en dos pasos fue desactivada.")
      await refreshFactors()
    } catch {
      setError("No se pudo desactivar MFA. Intentá de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  const handleCopySecret = async () => {
    if (!enroll?.secret) return
    try {
      await navigator.clipboard.writeText(enroll.secret)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("No se pudo copiar la clave. Copiala manualmente.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasMfa = factors.length > 0

  return (
    <div className="space-y-6">
      {!emphasize && !hasMfa && !enroll && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          No es obligatorio. Tu acceso actual con email y contraseña sigue funcionando igual.
        </div>
      )}

      {emphasize && !hasMfa && !enroll && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Como administrador, te recomendamos activar la verificación en dos pasos para proteger el
          panel.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Verificación en dos pasos (MFA)
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {emphasize
                ? "Usá Google Authenticator, Authy u otra app TOTP. Recomendado para cuentas de administración."
                : "Opcional: podés seguir entrando solo con email y contraseña. Si querés más seguridad, activá Google Authenticator o Authy cuando te parezca."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {info}
          </div>
        )}

        {hasMfa && !enroll && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              MFA activo
            </div>
            <ul className="space-y-3">
              {factors.map((factor) => (
                <li
                  key={factor.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {factor.friendly_name || "Authenticator"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleUnenroll(factor.id)}
                    className="gap-2 font-bold"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Desactivar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasMfa && !enroll && (
          <Button
            type="button"
            disabled={busy}
            onClick={() => void handleStartEnroll()}
            className="h-12 rounded-full px-8 font-bold"
          >
            {busy ? "Preparando..." : "Activar verificación de dos pasos"}
          </Button>
        )}

        {enroll && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Escaneá el código QR con tu app autenticadora o ingresá la clave manualmente.
            </p>

            {enroll.qrCode && (
              <div className="flex justify-center rounded-2xl border border-slate-100 bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enroll.qrCode}
                  alt="Código QR para configurar MFA"
                  className="h-48 w-48"
                />
              </div>
            )}

            {enroll.secret && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Clave secreta (manual)
                </Label>
                <div className="flex gap-2">
                  <code className="flex-1 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-mono text-slate-800">
                    {enroll.secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopySecret()}
                    className="shrink-0 gap-2 font-bold"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "OK" : "Copiar"}
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyEnroll} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-code" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Código de 6 dígitos
                </Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="h-12 tracking-[0.35em] text-center text-lg font-bold"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={busy} className="h-12 flex-1 rounded-full font-bold">
                  {busy ? "Verificando..." : "Confirmar y activar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  className="h-12 rounded-full font-bold"
                  onClick={() => {
                    setEnroll(null)
                    setCode("")
                    setError(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
