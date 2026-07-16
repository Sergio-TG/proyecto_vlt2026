"use client"

import * as React from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { COOKIES_CONSENT_EVENT, readCookiesConsent } from "@/lib/cookies-consent"

const GA_MEASUREMENT_ID = "G-CXPK7XCEWG"

/** Carga GA4 solo si el usuario aceptó cookies analíticas. */
export function GoogleAnalyticsConsent() {
  const [allowed, setAllowed] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setAllowed(readCookiesConsent() === "granted")
    sync()
    window.addEventListener(COOKIES_CONSENT_EVENT, sync)
    return () => window.removeEventListener(COOKIES_CONSENT_EVENT, sync)
  }, [])

  if (!allowed) return null
  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
}
