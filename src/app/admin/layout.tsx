import type { Metadata } from "next"
import { PanelShell } from "@/components/panel/PanelShell"
import { PanelAdminNav } from "@/components/panel/PanelAdminNav"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell panelTitle="Admin" footerVariant="admin" mainClassName="flex flex-1 w-full flex-col p-0">
      <PanelAdminNav />
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </PanelShell>
  )
}
