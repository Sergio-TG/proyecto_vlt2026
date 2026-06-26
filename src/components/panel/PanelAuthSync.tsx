"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type PanelAuthSyncProps = {
  panelTitle: "Admin" | "Socios"
}

export function PanelAuthSync({ panelTitle }: PanelAuthSyncProps) {
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) return

      if (panelTitle === "Admin" && pathname !== "/admin") {
        router.replace("/admin")
      }

      router.refresh()
    })

    return () => subscription.subscription.unsubscribe()
  }, [panelTitle, pathname, router])

  return null
}
