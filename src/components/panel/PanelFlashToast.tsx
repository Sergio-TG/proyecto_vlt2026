"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, X } from "lucide-react"

const FLASH_MESSAGES: Record<string, string> = {
  password_updated: "Tu contraseña se actualizó correctamente.",
  confirmed: "Tu cuenta fue confirmada. Ya podés usar el panel.",
  recovered: "Sesión recuperada. Si aún no cambiaste la clave, hacelo desde Seguridad.",
}

export function PanelFlashToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    for (const [key, text] of Object.entries(FLASH_MESSAGES)) {
      if (searchParams.get(key) === "1") {
        setMessage(text)
        const next = new URLSearchParams(searchParams.toString())
        next.delete(key)
        const qs = next.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
        break
      }
    }
  }, [pathname, router, searchParams])

  React.useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[80] flex w-[min(92vw,28rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-900 shadow-xl shadow-slate-900/10"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => setMessage(null)}
        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
