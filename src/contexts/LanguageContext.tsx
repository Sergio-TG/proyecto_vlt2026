"use client"

import * as React from "react"

export type SiteLocale = "es" | "en"

export const SITE_LOCALE_STORAGE_KEY = "vivillastermas_lang"

type LanguageContextValue = {
  locale: SiteLocale
  setLocale: (next: SiteLocale) => void
  toggleLocale: () => void
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<SiteLocale>("es")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(SITE_LOCALE_STORAGE_KEY)
    const initial: SiteLocale = stored === "en" ? "en" : "es"
    setLocaleState(initial)
    document.documentElement.lang = initial
  }, [])

  const setLocale = React.useCallback((next: SiteLocale) => {
    setLocaleState(next)
    window.localStorage.setItem(SITE_LOCALE_STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const toggleLocale = React.useCallback(() => {
    setLocaleState((prev) => {
      const next: SiteLocale = prev === "es" ? "en" : "es"
      window.localStorage.setItem(SITE_LOCALE_STORAGE_KEY, next)
      document.documentElement.lang = next
      return next
    })
  }, [])

  const value = React.useMemo(
    () => ({ locale, setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider")
  }
  return ctx
}
