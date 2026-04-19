"use client"

import Link from "next/link"
import { Facebook, Instagram, MessageCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function Footer() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
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
        body: JSON.stringify({ email: value, source: `footer:${pathname || ""}` }),
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
    <footer className="bg-slate-900 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 pb-16 border-b border-slate-800">
          <div className="max-w-xs">
            <Link href="/" className="inline-block mb-2">
              <img src="/logotipo.png" alt="Logotipo de Viví las Termas" className="h-16 w-auto brightness-0 invert object-contain" />
            </Link>
            <p className="text-slate-400 text-xs italic mb-6 tracking-widest uppercase">
              Donde el descanso se vuelve experiencia
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Descubrí la esencia de las sierras cordobesas. Alojamientos verificados, experiencias únicas y el bienestar de nuestras termas naturales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 flex-grow">
            {/* Column 1: Navigation */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Navegación</h4>
              <ul className="space-y-3 text-sm">
                {["Inicio", "Termas", "Alojamientos", "Experiencias", "Contacto"].map((item) => (
                  <li key={item}>
                    <Link
                      href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Termas */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Termas</h4>
              <ul className="space-y-3 text-sm">
                {["Pases de Día", "Masajes & Spa", "Clases de Yoga", "Sauna Finlandesa", "Eventos Privados"].map((item) => (
                  <li key={item}>
                    <Link href="/termas" className="hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">Tel:</span>
                  <span>+54 9 3546 525404</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">Email:</span>
                  <span>hola@vivillastermas.com.ar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">Ubicación:</span>
                  <span>Av. Marrero S/N, Villa Yacanto, X5197<br />Córdoba, Argentina</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex gap-4">
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col max-w-md md:ml-auto w-full">
            <h4 className="text-white font-bold text-lg mb-2">Newsletter</h4>
            <p className="mb-4 text-sm text-slate-400">Recibí ofertas exclusivas y novedades de temporada.</p>

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
                  <Button
                    type="submit"
                    disabled={status === "loading" || !email}
                    className="rounded-xl px-6 font-bold h-[42px] text-sm"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Suscribirse"
                    )}
                  </Button>
                </div>
                {status === "error" && (
                  <p className="text-xs text-red-400 ml-1">{message || "Ocurrió un error. Intentá de nuevo."}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© Copyright 2026 Viví las Termas. Todos los derechos reservados. </p>
          <p>Diseño y Desarrollo <a href="https://www.tgwebstudios.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">TG Web Studios</a></p>
        </div>
      </div>
    </footer>
  )
}
