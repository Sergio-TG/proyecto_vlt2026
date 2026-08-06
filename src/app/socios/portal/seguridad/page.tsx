"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ChangePasswordForm } from "@/components/panel/ChangePasswordForm"
import { MfaSetupPanel } from "@/components/panel/MfaSetupPanel"
import { Button } from "@/components/ui/button"

export default function SociosSeguridadPage() {
  return (
    <div className="relative flex flex-1 flex-col bg-slate-50 px-4 py-8 md:px-6">
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="mb-4 -ml-2 gap-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Link href="/socios/portal">
            <ArrowLeft className="h-4 w-4" />
            Volver al portal
          </Link>
        </Button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Seguridad</h1>
        <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
          Cambiá tu contraseña o activá un segundo factor opcional (Google Authenticator / Authy).
        </p>
      </div>
      <div className="mx-auto w-full max-w-xl space-y-6">
        <ChangePasswordForm />
        <MfaSetupPanel />
      </div>
    </div>
  )
}
