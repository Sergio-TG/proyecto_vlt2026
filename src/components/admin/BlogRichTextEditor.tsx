"use client"

import * as React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  ALLOWED_GALLERY_IMAGE_MIME,
  formatMegabytes,
  MAX_GALLERY_IMAGE_BYTES,
} from "@/lib/blog-media.config"
import { sanitizeHref } from "@/lib/blog-html"
import { cn } from "@/lib/utils"
import type { BlogGalleryItem } from "@/lib/blog"

type BlogRichTextEditorProps = {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  className?: string
  token?: string | null
  slug?: string
}

const TEXT_COLORS = [
  { label: "Texto", value: "#334155" },
  { label: "Negro", value: "#0f172a" },
  { label: "Rojo", value: "#e11d48" },
  { label: "Naranja", value: "#d97706" },
  { label: "Verde", value: "#16a34a" },
  { label: "Azul", value: "#2563eb" },
  { label: "Violeta", value: "#7c3aed" },
]

const HIGHLIGHT_COLORS = [
  { label: "Amarillo", value: "#fef08a" },
  { label: "Verde", value: "#bbf7d0" },
  { label: "Azul", value: "#bfdbfe" },
  { label: "Rosa", value: "#fbcfe8" },
  { label: "Naranja", value: "#fed7aa" },
  { label: "Gris", value: "#e2e8f0" },
]

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, " ").trim()
}

export function BlogRichTextEditor({
  id,
  label,
  value,
  onChange,
  rows = 12,
  placeholder,
  className,
  token = null,
  slug = "",
}: BlogRichTextEditorProps) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [mediaError, setMediaError] = React.useState<string | null>(null)
  const minHeight = Math.max(rows * 22, 280)
  const placeholderText = placeholder || "Escribí el contenido del artículo…"

  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rounded-xl max-w-full h-auto" },
      }),
      Placeholder.configure({ placeholder: placeholderText }),
    ],
    [placeholderText],
  )

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions,
    content: value || "",
    editorProps: {
      attributes: {
        id: id ?? "",
        class: "blog-editor-content outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML())
    },
  })

  React.useEffect(() => {
    if (!editor) return
    const next = value || ""
    if (normalizeHtml(editor.getHTML()) === normalizeHtml(next || "<p></p>")) return
    editor.commands.setContent(next, { emitUpdate: false })
  }, [value, editor])

  const insertImage = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file || !editor) return
    setMediaError(null)

    if (!token) {
      setMediaError("Tenés que estar autenticado para subir imágenes.")
      return
    }
    if (!slug.trim()) {
      setMediaError("Completá el título (o el slug) antes de insertar imágenes.")
      return
    }
    if (!ALLOWED_GALLERY_IMAGE_MIME.has(file.type)) {
      setMediaError("Formato no permitido. Usá JPG, PNG, WEBP o GIF.")
      return
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      setMediaError(`Cada imagen no puede superar los ${formatMegabytes(MAX_GALLERY_IMAGE_BYTES)}.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("slug", slug)
      formData.append("files", file)
      const res = await fetch("/api/admin/blog/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const json = (await res.json()) as { ok?: boolean; items?: BlogGalleryItem[]; error?: string }
      const url = json.items?.find((item) => item.type === "image")?.url
      if (!res.ok || !json.ok || !url) {
        throw new Error(json.error || "No se pudo subir la imagen.")
      }
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run()
    } catch (e: unknown) {
      setMediaError(e instanceof Error ? e.message : "Error al subir la imagen.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <EditorToolbar
          editor={editor}
          uploading={uploading}
          onInsertImage={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void insertImage(e.target.files)}
        />
        <div className="blog-editor max-h-[min(70vh,44rem)] overflow-y-auto" style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {mediaError ? <p className="text-xs text-rose-600">{mediaError}</p> : null}
      <p className="text-[11px] text-slate-400">
        Enter crea un párrafo; Shift+Enter inserta un salto de línea. Las imágenes se suben a
        ImageKit y quedan en la posición del cursor. El campo en inglés recibe el mismo HTML para
        la traducción, sin cambiar las claves guardadas en Supabase.
      </p>
    </div>
  )
}

function EditorToolbar({
  editor,
  uploading,
  onInsertImage,
}: {
  editor: Editor | null
  uploading: boolean
  onInsertImage: () => void
}) {
  if (!editor) {
    return <div className="h-12 border-b border-slate-100 bg-slate-50" />
  }

  const setLink = () => {
    const previous = String(editor.getAttributes("link").href || "")
    const next = window.prompt("URL del enlace", previous || "https://")
    if (next === null) return
    const trimmed = next.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    const href = sanitizeHref(trimmed)
    if (!href) {
      window.alert("URL no válida. Usá https://, mailto: o una ruta /interna.")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <ToolBtn title="Deshacer" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn title="Rehacer" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </ToolBtn>
      <Sep />
      <ToolBtn
        title="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Cursiva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Subrayado"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Tachado"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolBtn>
      <Sep />
      <ToolBtn
        title="Título H2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Título H3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Título H4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 className="h-3.5 w-3.5" />
      </ToolBtn>
      <Sep />
      <ToolBtn
        title="Alinear a la izquierda"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Centrar"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Alinear a la derecha"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Justificar"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolBtn>
      <Sep />
      <ToolBtn
        title="Lista con viñetas"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Cita destacada"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn title="Línea divisora" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn
        title="Bloque de código"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </ToolBtn>
      <Sep />
      <ColorMenu
        title="Color de texto"
        colors={TEXT_COLORS}
        current={String(editor.getAttributes("textStyle").color || "")}
        onPick={(color) => editor.chain().focus().setColor(color).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
      />
      <ColorMenu
        title="Resaltado"
        icon={<Highlighter className="h-3.5 w-3.5" />}
        colors={HIGHLIGHT_COLORS}
        current={String(editor.getAttributes("highlight").color || "")}
        onPick={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        onClear={() => editor.chain().focus().unsetHighlight().run()}
      />
      <Sep />
      <ToolBtn title="Enlace" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn title="Insertar imagen (ImageKit)" disabled={uploading} onClick={onInsertImage}>
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
      </ToolBtn>
    </div>
  )
}

function Sep() {
  return <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
}

function ToolBtn({
  title,
  onClick,
  children,
  active = false,
  disabled = false,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 text-slate-600 hover:bg-white hover:text-slate-900",
        active && "bg-white text-primary shadow-sm ring-1 ring-primary/20",
      )}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ColorMenu({
  title,
  colors,
  current,
  onPick,
  onClear,
  icon,
}: {
  title: string
  colors: { label: string; value: string }[]
  current: string
  onPick: (color: string) => void
  onClear: () => void
  icon?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {icon ?? (
          <span className="flex flex-col items-center leading-none">
            <span className="text-[11px] font-bold">A</span>
            <span
              className="mt-0.5 h-0.5 w-3.5 rounded-full"
              style={{ backgroundColor: current || "#e11d48" }}
            />
          </span>
        )}
      </Button>
      {open ? (
        <div className="absolute left-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <div className="grid grid-cols-6 gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                className={cn(
                  "h-6 w-6 rounded-md border border-slate-200",
                  current.toLowerCase() === color.value.toLowerCase() && "ring-2 ring-primary ring-offset-1",
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => {
                  onPick(color.value)
                  setOpen(false)
                }}
              />
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            Personalizado
            <input
              type="color"
              className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-white p-0"
              value={/^#[0-9a-fA-F]{6}$/.test(current) ? current : "#334155"}
              onChange={(e) => onPick(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="mt-1 w-full rounded px-1 py-1 text-left text-[11px] text-slate-500 hover:bg-slate-50"
            onClick={() => {
              onClear()
              setOpen(false)
            }}
          >
            Quitar
          </button>
        </div>
      ) : null}
    </div>
  )
}
