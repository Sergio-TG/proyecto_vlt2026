"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

const PROTECTION_CLASS = "content-protection"

function isLocalDevHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  )
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

async function resolveIsAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (typeof profile?.role === "string" && profile.role.toLowerCase() === "admin") {
      return true
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return false

    const res = await fetch("/api/admin/verify", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)

    if (!res?.ok) return false
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null
    return Boolean(json?.ok)
  } catch {
    return false
  }
}

/**
 * Medidas disuasorias de copyright para visitantes comunes.
 * Se desactiva en localhost y para sesiones con rol admin.
 */
export function ContentProtection() {
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement
    let active = false
    let cancelled = false
    let removeListeners: (() => void) | null = null

    const onContextMenu = (e: MouseEvent) => {
      if (isEditableTarget(e.target)) return
      e.preventDefault()
    }

    const onCopy = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return
      e.preventDefault()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      const key = e.key.toLowerCase()
      const ctrlOrMeta = e.ctrlKey || e.metaKey

      if (e.key === "F12") {
        e.preventDefault()
        return
      }

      if (ctrlOrMeta && (key === "u" || key === "c")) {
        e.preventDefault()
        return
      }

      if (ctrlOrMeta && e.shiftKey && key === "i") {
        e.preventDefault()
      }
    }

    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault()
      }
    }

    const enableProtection = () => {
      if (active) return
      active = true
      root.classList.add(PROTECTION_CLASS)
      document.addEventListener("contextmenu", onContextMenu)
      document.addEventListener("copy", onCopy)
      document.addEventListener("keydown", onKeyDown)
      document.addEventListener("dragstart", onDragStart)
      removeListeners = () => {
        document.removeEventListener("contextmenu", onContextMenu)
        document.removeEventListener("copy", onCopy)
        document.removeEventListener("keydown", onKeyDown)
        document.removeEventListener("dragstart", onDragStart)
      }
    }

    const disableProtection = () => {
      root.classList.remove(PROTECTION_CLASS)
      removeListeners?.()
      removeListeners = null
      active = false
    }

    const syncProtection = async () => {
      if (cancelled) return

      if (isLocalDevHost(window.location.hostname)) {
        disableProtection()
        return
      }

      const admin = await resolveIsAdmin()
      if (cancelled) return

      if (admin) {
        disableProtection()
      } else {
        enableProtection()
      }
    }

    void syncProtection()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncProtection()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
      disableProtection()
    }
  }, [])

  return null
}
