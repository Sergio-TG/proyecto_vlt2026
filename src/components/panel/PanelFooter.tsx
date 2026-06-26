type PanelFooterProps = {
  variant: "admin" | "socios"
}

export function PanelFooter({ variant }: PanelFooterProps) {
  const panelLabel = variant === "admin" ? "Panel de Administración" : "Panel de Socios"
  const isSocios = variant === "socios"

  return (
    <footer
      className={
        isSocios
          ? "relative z-30 mt-auto shrink-0 border-t border-white/10 bg-slate-950/95 px-4 py-4 text-center text-xs leading-relaxed text-slate-400 backdrop-blur-sm"
          : "relative z-30 mt-auto shrink-0 border-t border-slate-200 bg-white px-4 py-4 text-center text-xs leading-relaxed text-slate-500"
      }
    >
      © 2026 Viví las Termas - {panelLabel}. Todos los derechos reservados. Diseño y Desarrollo{" "}
      <a
        href="https://www.tgwebstudios.com"
        target="_blank"
        rel="noopener noreferrer"
        className={
          isSocios
            ? "font-medium text-slate-300 transition-colors hover:text-primary"
            : "font-medium text-slate-600 transition-colors hover:text-primary"
        }
      >
        TG Web Studios
      </a>
    </footer>
  )
}
