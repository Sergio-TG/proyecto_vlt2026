"use client"

import * as React from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function NewsletterSignup({
  sourcePrefix = "footer",
  title = "Newsletter",
  description = "Recibí ofertas exclusivas y novedades de temporada.",
}: {
  sourcePrefix?: string
  title?: string
  description?: string
}) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState<string | null>(null)
  const pathname = usePathname()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return

    setStatus("loading")
    setMessage(null)

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: `${sourcePrefix}:${pathname || ""}` }),
      })
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Ocurrió un error. Intentá de nuevo.")
      }
      setStatus("success")
      setMessage(json?.message || "¡Gracias por suscribirte!")
      setEmail("")
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err: unknown) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Ocurrió un error. Intentá de nuevo.")
    }
  }

  return (
    <div className="flex flex-col w-full">
      <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
      <p className="mb-4 text-sm text-slate-400">{description}</p>

      {status === "success" ? (
        <div className="flex items-center gap-3 bg-green-500/10 text-green-400 p-4 rounded-xl border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message || "¡Gracias por suscribirte!"}</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Tu email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50 text-sm"
            />
            <Button type="submit" disabled={status === "loading" || !email} className="rounded-xl px-6 font-bold h-[42px] text-sm">
              {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirse"}
            </Button>
          </div>
          {status === "error" && <p className="text-xs text-red-400 ml-1">{message || "Ocurrió un error. Intentá de nuevo."}</p>}
        </form>
      )}
    </div>
  )
}

