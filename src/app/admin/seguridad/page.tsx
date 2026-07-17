"use client"

import { MfaSetupPanel } from "@/components/panel/MfaSetupPanel"

export default function AdminSeguridadPage() {
  return (
    <div className="bg-slate-50 pb-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Seguridad</h1>
        <p className="text-sm font-medium text-slate-500 sm:text-base">
          Protegé tu cuenta de administrador con verificación en dos pasos.
        </p>
      </div>
      <MfaSetupPanel emphasize />
    </div>
  )
}
