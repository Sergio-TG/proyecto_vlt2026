"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ADMIN_LINKS: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Aprobaciones", exact: true },
  { href: "/admin/analytics", label: "Métricas" },
  { href: "/admin/invitar", label: "Invitar admin" },
  { href: "/admin/reviews", label: "Reseñas" },
  { href: "/admin/leads", label: "Leads" },
]

export function PanelAdminNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación del panel admin"
      className="sticky top-16 z-40 shrink-0 border-b border-slate-200 bg-white shadow-sm"
    >
      {/* Móvil/tablet: grid para que todos los ítems sean visibles sin scroll oculto */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-1.5 px-4 py-2.5 sm:grid-cols-3 md:px-6 xl:flex xl:flex-nowrap xl:gap-1 xl:py-2">
        {ADMIN_LINKS.map(({ href, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2.5 text-center text-sm font-bold transition-colors xl:shrink-0 xl:whitespace-nowrap xl:py-2 xl:text-left",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
