"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CookiesConsent = "granted" | "denied"

export function CookieBanner({ onConsentChange }: { onConsentChange?: (value: CookiesConsent) => void }) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const stored = window.localStorage.getItem("cookies_consent")
    if (stored === "granted" || stored === "denied") return
    setIsVisible(true)
  }, [])

  const setConsent = React.useCallback(
    (value: CookiesConsent) => {
      window.localStorage.setItem("cookies_consent", value)
      setIsVisible(false)
      onConsentChange?.(value)
    },
    [onConsentChange]
  )

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2">
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xl px-4 py-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Preferencias de cookies</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Usamos cookies para mejorar la experiencia y, si aceptás, medir el tráfico con analítica.
              <span className="ml-1">
                <Link href="/cookies" className="font-semibold text-[#4aa39e] hover:underline">
                  Ver política de cookies
                </Link>
                .
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:ml-auto">
            <Button
              type="button"
              onClick={() => setConsent("denied")}
              variant="secondary"
              className="h-10 rounded-lg"
            >
              Rechazar
            </Button>
            <Button type="button" onClick={() => setConsent("granted")} className="h-10 rounded-lg bg-[#4aa39e] hover:bg-[#3f9792]">
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
