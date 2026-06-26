"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, ExternalLink, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PanelProfileModal } from "@/components/panel/PanelProfileModal"
import { supabase } from "@/lib/supabase"

type PanelTopbarProps = {
  panelTitle: "Admin" | "Socios"
}

function getInitials(email?: string | null) {
  if (!email) return "?"
  const local = email.split("@")[0] ?? email
  return local.slice(0, 2).toUpperCase()
}

export function PanelTopbar({ panelTitle }: PanelTopbarProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const profileHref = panelTitle === "Admin" ? "/admin" : "/socios/portal"

  const syncUserProfile = React.useCallback(
    (user: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined) => {
      setEmail(user?.email ?? null)
      const metaAvatar = user?.user_metadata?.avatar_url
      setAvatarUrl(typeof metaAvatar === "string" && metaAvatar.trim() ? metaAvatar : null)
    },
    [],
  )

  const verifyPanelAccess = React.useCallback(
    async (session: { access_token?: string; user?: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session?.user) {
        syncUserProfile(null)
        setIsAuthenticated(false)
        return
      }

      if (panelTitle === "Socios") {
        syncUserProfile(session.user)
        setIsAuthenticated(true)
        return
      }

      const token = session.access_token
      if (!token) {
        syncUserProfile(null)
        setIsAuthenticated(false)
        return
      }

      const res = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
      const json = (await res?.json().catch(() => null)) as { ok?: boolean } | null
      const ok = Boolean(res?.ok) && Boolean(json?.ok)

      if (ok) {
        syncUserProfile(session.user)
        setIsAuthenticated(true)
      } else {
        syncUserProfile(null)
        setIsAuthenticated(false)
      }
    },
    [panelTitle, syncUserProfile],
  )

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      void verifyPanelAccess(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void verifyPanelAccess(session)
    })

    return () => subscription.subscription.unsubscribe()
  }, [verifyPanelAccess])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (!isAuthenticated) {
      setMenuOpen(false)
      setProfileOpen(false)
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    setMenuOpen(false)
    setProfileOpen(false)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
    syncUserProfile(null)
    setIsAuthenticated(false)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 h-16 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
        <Link href={profileHref} className="flex min-w-0 items-center gap-3">
          <img src="/logotipo.png" alt="Viví las Termas" className="h-8 w-auto object-contain" />
          <span className="truncate text-sm font-black tracking-tight text-slate-900">{panelTitle}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 font-semibold text-slate-600 hover:text-slate-900"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Ver Sitio Público</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </a>
          </Button>

          {isAuthenticated ? (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 transition-colors hover:border-primary/30 hover:bg-slate-50"
                aria-label="Menú de usuario"
                aria-expanded={menuOpen}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : email ? (
                  <span className="text-xs font-black text-slate-700">{getInitials(email)}</span>
                ) : (
                  <User className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setProfileOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Mi Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <PanelProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        email={email}
        avatarUrl={avatarUrl}
        onAvatarUpdated={setAvatarUrl}
      />
    </header>
  )
}
