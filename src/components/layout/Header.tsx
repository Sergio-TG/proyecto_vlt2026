"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Globe, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Termas", href: "/termas" },
  { name: "Alojamientos", href: "/alojamientos" },
  { name: "Experiencias", href: "/experiencias" },
  { name: "Nuestra Esencia", href: "/nuestra-esencia" },
  { name: "Contacto", href: "/contacto" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [language, setLanguage] = React.useState<"es" | "en">("es")
  const { scrollY } = useScroll()
  const pathname = usePathname()

  // Pages that have a dark hero section and support transparent header
  const isTransparentPage = pathname === "/" || pathname === "/termas" || pathname === "/experiencias" || pathname === "/nuestra-esencia" || (pathname.startsWith("/alojamientos/") && pathname !== "/alojamientos");

  useMotionValueEvent(scrollY, "change", (latest) => {
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

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("vivillastermas_lang")
    const initial = stored === "en" ? "en" : "es"
    setLanguage(initial)
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === "es" ? "en" : "es"
      if (typeof window !== "undefined") {
        window.localStorage.setItem("vivillastermas_lang", next)
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = next
      }
      return next
    })
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isTransparentPage ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <img 
            src="/logo.png" 
            alt="Logotipo de Viví las Termas" 
            className={cn(
              "h-20 md:h-28 w-auto transition-all duration-300 object-contain",
              isScrolled || !isTransparentPage ? "" : "brightness-0 invert"
            )}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
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
            onClick={toggleLanguage}
            className={cn(
              "gap-2 font-medium",
              isScrolled || !isTransparentPage ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/20"
            )}
          >
            <Globe className="h-4 w-4" />
            <span>{language.toUpperCase()}</span>
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
              Planifica tu Viaje
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
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium text-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-4">
               <Button variant="outline" className="w-full justify-center gap-2" onClick={toggleLanguage}>
                 <Globe className="h-4 w-4" /> {language === "es" ? "ES / EN" : "EN / ES"}
               </Button>
               <Link href="/#planificar-viaje">
                 <Button className="w-full">Planifica tu Viaje</Button>
               </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
