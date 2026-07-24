"use client"

import * as React from "react"
import { GripVertical, ImagePlus, Loader2, Trash2, Video as VideoIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { BlogGalleryItem } from "@/lib/blog"
import {
  MAX_GALLERY_ITEMS,
  MAX_GALLERY_IMAGE_BYTES,
  MAX_GALLERY_VIDEO_BYTES,
  validateGalleryFile,
} from "@/lib/blog-media.config"
import { cn } from "@/lib/utils"

type BlogGalleryEditorProps = {
  items: BlogGalleryItem[]
  slug: string
  token: string | null
  onChange: (items: BlogGalleryItem[]) => void
}

/** Editor de galería multimedia: drag & drop múltiple, reordenar y eliminar. */
export function BlogGalleryEditor({ items, slug, token, onChange }: BlogGalleryEditorProps) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragIndexRef = React.useRef<number | null>(null)
  const [overIndex, setOverIndex] = React.useState<number | null>(null)

  const uploadFiles = async (fileList: FileList | File[] | null) => {
    if (!fileList || !token) return
    const files = Array.from(fileList)
    if (files.length === 0) return

    setError(null)

    if (items.length + files.length > MAX_GALLERY_ITEMS) {
      setError(`Podés tener como máximo ${MAX_GALLERY_ITEMS} elementos en la galería.`)
      return
    }

    const invalid = files
      .map((file) => validateGalleryFile(file))
      .filter((msg): msg is string => Boolean(msg))
    if (invalid.length > 0) {
      setError(invalid[0])
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("slug", slug)
      files.forEach((file) => formData.append("files", file))

      const res = await fetch("/api/admin/blog/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const json = (await res.json()) as { ok?: boolean; items?: BlogGalleryItem[]; error?: string }
      if (!res.ok || !json.ok || !json.items) {
        throw new Error(json.error || "Error al subir los archivos.")
      }

      onChange([...items, ...json.items])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir los archivos.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setOverIndex(index)
  }

  const handleDropItem = (index: number) => {
    const from = dragIndexRef.current
    dragIndexRef.current = null
    setOverIndex(null)
    if (from === null || from === index) return

    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold text-slate-700">
            Galería multimedia (imágenes y videos)
          </Label>
        </div>
        <span className="text-xs text-slate-400">
          {items.length}/{MAX_GALLERY_ITEMS}
        </span>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDrop={() => handleDropItem(index)}
              onDragEnd={() => setOverIndex(null)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-slate-50",
                overIndex === index ? "border-primary ring-2 ring-primary/40" : "border-slate-200",
              )}
            >
              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900">
                  <video src={item.url} className="h-full w-full object-cover opacity-80" muted preload="metadata" />
                  <VideoIcon className="absolute h-6 w-6 text-white drop-shadow" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}

              <div className="absolute left-1 top-1 flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3.5 w-3.5" />
              </div>

              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="Eliminar de la galería"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-red-600/90 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_GALLERY_ITEMS && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            uploadFiles(e.dataTransfer.files)
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
              <p className="text-sm text-slate-500">Subiendo archivos…</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Arrastrá imágenes o videos, o hacé clic para seleccionar varios
              </p>
              <p className="text-xs text-slate-400">
                JPG, PNG, WEBP, GIF, MP4, WEBM · imágenes hasta {Math.round(MAX_GALLERY_IMAGE_BYTES / (1024 * 1024))} MB
                · videos hasta {Math.round(MAX_GALLERY_VIDEO_BYTES / (1024 * 1024))} MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Arrastrá una miniatura para reordenar la secuencia en el carrusel del post.
      </p>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
