export const COOKIES_CONSENT_KEY = "cookies_consent"
export const COOKIES_CONSENT_EVENT = "vivi:cookies-consent"

export type CookiesConsent = "granted" | "denied"

export function readCookiesConsent(): CookiesConsent | null {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(COOKIES_CONSENT_KEY)
  return value === "granted" || value === "denied" ? value : null
}

export function writeCookiesConsent(value: CookiesConsent): void {
  window.localStorage.setItem(COOKIES_CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent(COOKIES_CONSENT_EVENT, { detail: value }))
}
