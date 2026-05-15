"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { locale, toggleLocale } = useLanguage()
  const copy = getSiteCopy(locale)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  // Pages that have a dark hero section and support transparent header
  const isTransparentPage =
    pathname === "/" ||
    pathname === "/termas" ||
    pathname === "/experiencias" ||
    pathname === "/alojamientos" ||
    pathname === "/contacto" ||
    pathname === "/admin" ||
    pathname === "/socios" ||
    (pathname.startsWith("/alojamientos/") && pathname !== "/alojamientos");

  useMotionValueEvent(scrollY, "change", () => {
    // Logic moved to native scroll listener for better performance
  })

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  }

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20",
        isScrolled || !isTransparentPage ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50 h-full">
          <img 
            src="/logotipo.png" 
            alt={copy.header.logoAlt} 
            className={cn(
              "max-h-12 w-auto transition-all duration-300 object-contain block",
              isScrolled || !isTransparentPage ? "" : "brightness-0 invert"
            )}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {copy.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[15px] font-semibold transition-all duration-200 hover:text-primary",
                isScrolled || !isTransparentPage ? "text-slate-700" : "text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className={cn(
              "gap-2 font-medium",
              isScrolled || !isTransparentPage ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/20"
            )}
          >
            <Globe className="h-4 w-4" />
            <span>{locale.toUpperCase()}</span>
          </Button>
          <Link href="/#planificar-viaje">
            <Button 
              className={cn(
                 "font-bold px-6 py-2 rounded-full transition-all duration-300",
                 !isScrolled && isTransparentPage 
                  ? "bg-white text-primary hover:bg-white/90" 
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {copy.header.planTrip}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={cn("h-6 w-6", "text-foreground")} />
          ) : (
            <Menu className={cn("h-6 w-6", isScrolled || !isTransparentPage ? "text-foreground" : "text-white")} />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 md:hidden flex flex-col items-center justify-center gap-8">
            <nav className="flex flex-col items-center gap-6">
              {copy.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-4">
               <Button variant="outline" className="w-full justify-center gap-2" onClick={toggleLocale}>
                 <Globe className="h-4 w-4" /> {locale === "es" ? copy.header.mobileLangHint : copy.header.mobileLangHintEn}
               </Button>
               <Link href="/#planificar-viaje">
                 <Button className="w-full">{copy.header.planTrip}</Button>
               </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
