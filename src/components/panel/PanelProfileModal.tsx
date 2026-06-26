"use client"

import * as React from "react"
import { Camera, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

type PanelProfileModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string | null
  avatarUrl: string | null
  onAvatarUpdated: (url: string) => void
}

function getInitials(email?: string | null) {
  if (!email) return "?"
  const local = email.split("@")[0] ?? email
  return local.slice(0, 2).toUpperCase()
}

export function PanelProfileModal({
  open,
  onOpenChange,
  email,
  avatarUrl,
  onAvatarUpdated,
}: PanelProfileModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const displayAvatar = previewUrl || avatarUrl

  React.useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      setSelectedFile(null)
      setError(null)
      setSaving(false)
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Seleccioná un archivo de imagen válido.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar como máximo 5 MB.")
      return
    }

    setError(null)
    setSelectedFile(file)
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleSave = async () => {
    if (!selectedFile) {
      setError("Seleccioná una imagen para continuar.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error("No hay sesión activa. Volvé a iniciar sesión.")
      }

      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: formData,
      })

      const uploadJson = (await uploadRes.json()) as { ok?: boolean; url?: string; error?: string }
      if (!uploadRes.ok || !uploadJson.ok || !uploadJson.url) {
        throw new Error(uploadJson.error || "No se pudo subir la imagen.")
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: uploadJson.url },
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      onAvatarUpdated(uploadJson.url)
      onOpenChange(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar el perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mi Perfil</DialogTitle>
          <DialogDescription>
            Actualizá tu foto de perfil. Se mostrará en la barra superior del panel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Correo</Label>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {email || "—"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary/40 hover:bg-slate-100"
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt="" className="h-full w-full object-cover" />
              ) : email ? (
                <span className="text-xl font-black text-slate-600">{getInitials(email)}</span>
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Elegir imagen
            </Button>
            <p className="text-center text-xs text-slate-400">JPG, PNG, WEBP o GIF · máx. 5 MB</p>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !selectedFile}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
