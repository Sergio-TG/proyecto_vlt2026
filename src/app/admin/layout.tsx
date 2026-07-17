import type { Metadata } from "next"
import { headers } from "next/headers"
import { PanelShell } from "@/components/panel/PanelShell"
import { PanelAdminNav } from "@/components/panel/PanelAdminNav"
import { requireAdminRole } from "@/lib/rbac"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  // La aceptación de invitación debe ser accesible antes de tener rol admin.
  const isAcceptInvite = pathname.startsWith("/admin/accept-invite")

  if (!isAcceptInvite) {
    await requireAdminRole()
  }

  return (
    <PanelShell panelTitle="Admin" footerVariant="admin" mainClassName="flex flex-1 w-full flex-col p-0">
      {!isAcceptInvite && <PanelAdminNav />}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </PanelShell>
  )
}
