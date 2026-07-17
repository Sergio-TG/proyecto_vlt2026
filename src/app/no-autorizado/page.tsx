import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "No autorizado | Viví las Termas",
  robots: { index: false, follow: false },
}

export default function NoAutorizadoPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">No autorizado</h1>
          <p className="text-sm font-medium leading-relaxed text-slate-400">
            Tu cuenta no tiene permisos para acceder a esta sección del portal.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="h-11 rounded-full px-8 font-bold">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-white/20 bg-transparent px-8 font-bold text-white hover:bg-white/10"
          >
            <Link href="/login">Iniciar sesión con otra cuenta</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
