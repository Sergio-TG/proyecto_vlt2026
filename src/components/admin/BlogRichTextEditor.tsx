"use client"

import * as React from "react"
import { Bold, Italic, Link2, Strikethrough, Underline } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { wrapRichSelection, type RichWrapKind } from "@/lib/blog-rich-text"
import { cn } from "@/lib/utils"

type BlogRichTextEditorProps = {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  className?: string
}

export function BlogRichTextEditor({
  id,
  label,
  value,
  onChange,
  rows = 8,
  placeholder,
  className,
}: BlogRichTextEditorProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const apply = (kind: RichWrapKind) => {
    const el = ref.current
    if (!el) return
    const { next, cursorStart, cursorEnd } = wrapRichSelection(
      value,
      el.selectionStart,
      el.selectionEnd,
      kind,
    )
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursorStart, cursorEnd)
    })
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton title="Negrita" onClick={() => apply("bold")}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Cursiva" onClick={() => apply("italic")}>
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Subrayado" onClick={() => apply("underline")}>
            <Underline className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Tachado" onClick={() => apply("strike")}>
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Enlace" onClick={() => apply("link")}>
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      </div>
      <Textarea
        id={id}
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\r\n/g, "\n"))}
        placeholder={placeholder}
        className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed"
      />
      <p className="text-[11px] text-slate-400">
        Seleccioná texto y usá la barra, o escribí{" "}
        <code className="rounded bg-slate-100 px-1">**negrita**</code>,{" "}
        <code className="rounded bg-slate-100 px-1">*cursiva*</code>,{" "}
        <code className="rounded bg-slate-100 px-1">++subrayado++</code>,{" "}
        <code className="rounded bg-slate-100 px-1">~~tachado~~</code>,{" "}
        <code className="rounded bg-slate-100 px-1">[texto](url)</code>.{" "}
        <strong className="font-semibold text-slate-500">Enter</strong> = salto de línea;{" "}
        <strong className="font-semibold text-slate-500">Enter dos veces</strong> = nuevo párrafo. Al
        pegar traducciones se conservan los saltos.
      </p>
    </div>
  )
}

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-8 p-0"
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
