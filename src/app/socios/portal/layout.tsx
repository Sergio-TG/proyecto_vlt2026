import type { Metadata } from "next"
import { PanelShell } from "@/components/panel/PanelShell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SociosPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell panelTitle="Socios" footerVariant="socios" mainClassName="relative flex flex-1 flex-col min-h-0 w-full">
      {children}
    </PanelShell>
  )
}
