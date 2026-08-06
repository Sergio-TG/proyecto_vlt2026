import { Suspense } from "react"
import { PanelAuthSync } from "@/components/panel/PanelAuthSync"
import { PanelFlashToast } from "@/components/panel/PanelFlashToast"
import { PanelFooter } from "@/components/panel/PanelFooter"
import { PanelTopbar } from "@/components/panel/PanelTopbar"

type PanelShellProps = {
  panelTitle: "Admin" | "Socios"
  footerVariant: "admin" | "socios"
  mainClassName?: string
  children: React.ReactNode
}

export function PanelShell({
  panelTitle,
  footerVariant,
  mainClassName,
  children,
}: PanelShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PanelAuthSync panelTitle={panelTitle} />
      <PanelTopbar panelTitle={panelTitle} />
      <main className={mainClassName ?? "flex-1 w-full p-4 md:p-6"}>{children}</main>
      <PanelFooter variant={footerVariant} />
      <Suspense fallback={null}>
        <PanelFlashToast />
      </Suspense>
    </div>
  )
}
