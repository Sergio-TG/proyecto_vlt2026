"use client"

import * as React from "react"
import { Headphones, Loader2, Trash2, UploadCloud } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BlogAudioPlayer } from "@/components/blog/BlogAudioPlayer"
import { uploadPodcastAudio, deletePodcastAudioByUrl } from "@/lib/podcast-upload-client"
import { ALLOWED_AUDIO_EXTENSIONS, MAX_AUDIO_BYTES, validateAudioFile, formatMegabytes } from "@/lib/blog-media.config"
import { cn } from "@/lib/utils"

type BlogAudioUploaderProps = {
  audioUrl: string
  audioTitle: string
  slug: string
  token: string | null
  onChange: (next: { audio_url: string; audio_title: string }) => void
}

/** Carga y previsualización del audio/podcast del post (Supabase Storage, bucket `podcasts`). */
export function BlogAudioUploader({
  audioUrl,
  audioTitle,
  slug,
  token,
  onChange,
}: BlogAudioUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | null) => {
    if (!file) return
    setError(null)

    if (!token) {
      setError("Sesión de administrador requerida para subir audio.")
      return
    }

    const validationError = validateAudioFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    try {
      const url = await uploadPodcastAudio(file, slug, token)
      onChange({ audio_url: url, audio_title: audioTitle })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir el audio.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = async () => {
    if (audioUrl && token) {
      await deletePodcastAudioByUrl(audioUrl, token)
    }
    onChange({ audio_url: "", audio_title: "" })
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <Headphones className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold text-slate-700">Audio / Podcast (opcional)</Label>
      </div>

      {audioUrl ? (
        <div className="space-y-3">
          <BlogAudioPlayer src={audioUrl} title={audioTitle} />
          <div className="space-y-2">
            <Label>Título del episodio</Label>
            <Input
              value={audioTitle}
              placeholder="Ej: Episodio 12 — Rutas termales de Calamuchita"
              onChange={(e) => onChange({ audio_url: audioUrl, audio_title: e.target.value })}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRemove} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Quitar audio
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0] ?? null)
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40 hover:bg-slate-50",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Subiendo audio…</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Arrastrá un archivo de audio o hacé clic para seleccionar
              </p>
              <p className="text-xs text-slate-400">
                {ALLOWED_AUDIO_EXTENSIONS.join(", ")} · máx. {formatMegabytes(MAX_AUDIO_BYTES)}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={[
              "audio/mpeg",
              "audio/mp3",
              "audio/mp4",
              "audio/x-m4a",
              "audio/m4a",
              "audio/wav",
              "audio/aac",
              "audio/ogg",
              ...ALLOWED_AUDIO_EXTENSIONS,
            ].join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
