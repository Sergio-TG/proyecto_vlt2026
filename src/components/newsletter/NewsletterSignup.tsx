"use client"

import * as React from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

type NewsletterVariant = "footer" | "home" | "alojamiento"

export function NewsletterSignup({
  variant = "footer",
  sourcePrefix = "footer",
  source,
  title = "Newsletter",
  description = "Recibí ofertas exclusivas y novedades de temporada.",
}: {
  variant?: NewsletterVariant
  sourcePrefix?: string
  source?: string
  title?: string
  description?: string
}) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState<string | null>(null)
  const pathname = usePathname()
  const baseSource = (source || "").trim() || (variant === "footer" ? sourcePrefix : variant)
  const sourceValue = `${baseSource}:${pathname || ""}`.slice(0, 80)

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return

    setStatus("loading")
    setMessage(null)

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        body: new FormData(e.currentTarget),
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
if (variant === "home" || variant === "alojamiento") {
  return (
    <section className="w-full bg-teal-700 text-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Contenedor principal con centrado */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h2>
          <p className="mt-4 text-white/90 font-medium max-w-xl mx-auto">{description}</p>

          {/* Formulario con max-w-lg para mejor proporción visual */}
          <div className="mt-10 max-w-lg mx-auto">
            {status === "success" ? (
              <div className="flex items-center justify-center gap-3 bg-white/10 text-white p-5 rounded-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{message || "¡Gracias por suscribirte!"}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="Escribe tu email aquí"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    className="bg-white/95 border border-white/30 text-slate-900 px-4 py-3 rounded-xl flex-1 focus:ring-2 focus:ring-white/40 outline-none transition-all disabled:opacity-50 text-sm placeholder:text-slate-500"
                  />
                  <input type="hidden" name="source" value={sourceValue} />
                  <Button
                    type="submit"
                    disabled={status === "loading" || !email}
                    className="rounded-xl px-8 font-black h-[46px] text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
                  >
                    {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suscribirme"}
                  </Button>
                </div>
                
                {/* Disclaimer con espaciado superior y centrado */}
                <div className="text-[11px] text-white/70 font-medium mt-2 text-center">
                  Al suscribirte confirmás que aceptás nuestros Términos y Condiciones.
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-200 font-semibold mt-1">{message || "Ocurrió un error. Intentá de nuevo."}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
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
              name="email"
              placeholder="Tu email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50 text-sm"
            />
            <input type="hidden" name="source" value={sourceValue} />
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
