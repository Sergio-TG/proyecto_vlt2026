"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

/** Desktop nav desde 1280px; tablets usan menú hamburguesa. */
const DESKTOP_NAV_CLASS = "hidden xl:flex"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { locale, toggleLocale } = useLanguage()
  const copy = getSiteCopy(locale)
  const pathname = usePathname()

  // Solo páginas con hero oscuro a full-bleed. Los posts (/blog/[slug]) tienen
  // fondo blanco desde el primer viewport: si van en modo transparente, logo y
  // links quedan en blanco sobre blanco y "desaparecen" (solo se ve el CTA).
  const isTransparentPage =
    pathname === "/" ||
    pathname === "/termas" ||
    pathname === "/experiencias" ||
    pathname === "/alojamientos" ||
    pathname === "/contacto" ||
    pathname === "/blog" ||
    pathname === "/socios" ||
    (pathname.startsWith("/alojamientos/") && pathname !== "/alojamientos")

  const showSolidHeader = isScrolled || !isTransparentPage || isMobileMenuOpen

  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  React.useEffect(() => {
    const syncScroll = () => setIsScrolled(window.scrollY > 16)
    syncScroll()
    window.addEventListener("scroll", syncScroll, { passive: true })
    return () => window.removeEventListener("scroll", syncScroll)
  }, [pathname])

  React.useEffect(() => {
    if (!isMobileMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isMobileMenuOpen])

  React.useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 h-20 transition-all duration-300",
          isMobileMenuOpen ? "z-[60]" : "z-50",
          showSolidHeader
            ? "border-b border-slate-200/80 bg-white shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <Link href="/" className="relative z-[60] flex h-full items-center gap-2">
            <img
              src="/logotipo.png"
              alt={copy.header.logoAlt}
              className={cn(
                "block max-h-12 w-auto object-contain transition-all duration-300",
                showSolidHeader ? "" : "brightness-0 invert",
              )}
            />
          </Link>

          <nav className={cn(DESKTOP_NAV_CLASS, "items-center gap-6 2xl:gap-8")}>
            {copy.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-semibold transition-colors duration-200 hover:text-primary",
                  showSolidHeader ? "text-slate-700" : "text-white",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={cn(DESKTOP_NAV_CLASS, "items-center gap-3")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              className={cn(
                "gap-2 font-medium",
                showSolidHeader ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/20",
              )}
            >
              <Globe className="h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </Button>
            <Link href="/socios/portal">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full border-2 px-4 font-semibold transition-all duration-300",
                  showSolidHeader
                    ? "border-primary text-primary hover:bg-primary/5"
                    : "border-white/80 bg-white/10 text-white hover:bg-white/20",
                )}
              >
                {copy.header.accessSocios}
              </Button>
            </Link>
            <Link href="/#planificar-viaje">
              <Button
                className={cn(
                  "rounded-full px-6 py-2 font-bold transition-all duration-300",
                  !showSolidHeader && isTransparentPage
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-white hover:bg-primary/90",
                )}
              >
                {copy.header.planTrip}
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className={cn(
              "relative z-[60] rounded-lg p-2.5 xl:hidden",
              isMobileMenuOpen && "bg-slate-100 ring-2 ring-slate-200/80",
            )}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu
                className={cn(
                  "h-6 w-6",
                  showSolidHeader ? "text-slate-900" : "text-white",
                )}
              />
            )}
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div
          className="fixed inset-0 z-[55] bg-white xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
            <nav className="flex flex-col items-center gap-6">
              {copy.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-semibold text-slate-900 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-slate-200"
                onClick={toggleLocale}
              >
                <Globe className="h-4 w-4" />
                {locale === "es" ? copy.header.mobileLangHint : copy.header.mobileLangHintEn}
              </Button>
              <Link href="/socios/portal" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-slate-200 font-semibold">
                  {copy.header.accessSocios}
                </Button>
              </Link>
              <Link href="/#planificar-viaje" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full font-bold">{copy.header.planTrip}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
