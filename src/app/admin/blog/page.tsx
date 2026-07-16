"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BlogRichTextEditor } from "@/components/admin/BlogRichTextEditor"
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  FilePenLine,
  Lock,
  Newspaper,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react"
import { slugify } from "@/lib/utils"
import type { BlogPostRow, BlogPostStatus } from "@/lib/blog"

type FormState = {
  id: string | null
  slug: string
  title_es: string
  title_en: string
  excerpt_es: string
  excerpt_en: string
  paragraphs_es: string
  paragraphs_en: string
  category_es: string
  category_en: string
  image: string
  status: BlogPostStatus
  published_at: string
}

const EMPTY_FORM: FormState = {
  id: null,
  slug: "",
  title_es: "",
  title_en: "",
  excerpt_es: "",
  excerpt_en: "",
  paragraphs_es: "",
  paragraphs_en: "",
  category_es: "",
  category_en: "",
  image: "",
  status: "draft",
  published_at: "",
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function rowToForm(row: BlogPostRow): FormState {
  return {
    id: row.id,
    slug: row.slug,
    title_es: row.title_es,
    title_en: row.title_en,
    excerpt_es: row.excerpt_es,
    excerpt_en: row.excerpt_en,
    paragraphs_es: row.paragraphs_es.join("\n\n"),
    paragraphs_en: row.paragraphs_en.join("\n\n"),
    category_es: row.category_es,
    category_en: row.category_en,
    image: row.image,
    status: row.status,
    published_at: toDatetimeLocal(row.published_at),
  }
}

function statusBadge(status: BlogPostStatus) {
  if (status === "published") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Publicado</Badge>
  }
  if (status === "archived") {
    return <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">Archivado</Badge>
  }
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Borrador</Badge>
}

function formatUpdated(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })
}

export default function AdminBlogPage() {
  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [posts, setPosts] = React.useState<BlogPostRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [filter, setFilter] = React.useState<"all" | BlogPostStatus>("all")

  React.useEffect(() => {
    let ignore = false

    async function verify() {
      setAuthLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token || null

      if (!accessToken) {
        if (!ignore) {
          setIsAdmin(false)
          setToken(null)
          setAuthLoading(false)
        }
        return
      }

      const res = await fetch("/api/admin/verify", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => null)

      const json = (await res?.json().catch(() => null)) as { ok?: boolean } | null
      const ok = Boolean(res?.ok) && Boolean(json?.ok)

      if (!ignore) {
        setIsAdmin(ok)
        setToken(ok ? accessToken : null)
        setAuthLoading(false)
      }
    }

    verify()
    return () => {
      ignore = true
    }
  }, [])

  const fetchPosts = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/blog", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = (await res.json()) as {
        ok?: boolean
        posts?: BlogPostRow[]
        error?: string
        reason?: string
      }

      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Error al cargar posts (${res.status})`)
      }

      setPosts(json.posts ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar el blog"
      setError(message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (isAdmin && token) {
      fetchPosts()
    }
  }, [isAdmin, token, fetchPosts])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  const openEdit = (row: BlogPostRow) => {
    setForm(rowToForm(row))
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  const closeForm = () => {
    setFormOpen(false)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id || undefined,
          slug: form.slug || slugify(form.title_es),
          title_es: form.title_es,
          title_en: form.title_en,
          excerpt_es: form.excerpt_es,
          excerpt_en: form.excerpt_en,
          paragraphs_es: form.paragraphs_es,
          paragraphs_en: form.paragraphs_en,
          category_es: form.category_es,
          category_en: form.category_en,
          image: form.image,
          status: form.status,
          published_at: fromDatetimeLocal(form.published_at),
        }),
      })

      const json = (await res.json()) as { ok?: boolean; error?: string; post?: BlogPostRow }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "No se pudo guardar el artículo")
      }

      setSuccess(form.id ? "Artículo actualizado" : "Artículo creado")
      closeForm()
      await fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: BlogPostStatus) => {
    if (!token) return
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/admin/blog/status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "No se pudo cambiar el estado")
      }
      setSuccess(
        status === "published"
          ? "Artículo publicado"
          : status === "archived"
            ? "Artículo archivado"
            : "Pasado a borrador",
      )
      await fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!token) return
    if (!window.confirm(`¿Eliminar permanentemente "${title}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "No se pudo eliminar")
      }
      setSuccess("Artículo eliminado")
      if (form.id === id) closeForm()
      await fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const filtered = posts.filter((post) => (filter === "all" ? true : post.status === filter))

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Verificando acceso…
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-lg border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Lock className="h-5 w-5" />
            Acceso restringido
          </CardTitle>
          <CardDescription className="text-amber-800">
            Iniciá sesión como administrador para gestionar el blog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin">Ir al panel admin</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <Newspaper className="h-6 w-6 text-primary" />
            Blog
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Creá, editá, publicá y archivá artículos. El listado público solo muestra los publicados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => fetchPosts()} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["published", "Publicados"],
            ["draft", "Borradores"],
            ["archived", "Archivados"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{form.id ? "Editar artículo" : "Nuevo artículo"}</CardTitle>
                  <CardDescription>
                    Seleccioná texto en los párrafos y usá negrita, cursiva, subrayado, tachado o
                    enlace. Separá párrafos con una línea en blanco. El slug se genera desde el
                    título si lo dejás vacío.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={closeForm} aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Título (ES) *</Label>
                    <Input
                      value={form.title_es}
                      onChange={(e) => {
                        const title_es = e.target.value
                        setForm((prev) => ({
                          ...prev,
                          title_es,
                          slug: prev.id ? prev.slug : slugify(title_es),
                        }))
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título (EN)</Label>
                    <Input
                      value={form.title_en}
                      onChange={(e) => setForm((prev) => ({ ...prev, title_en: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as BlogPostStatus,
                        }))
                      }
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría (ES)</Label>
                    <Input
                      value={form.category_es}
                      onChange={(e) => setForm((prev) => ({ ...prev, category_es: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría (EN)</Label>
                    <Input
                      value={form.category_en}
                      onChange={(e) => setForm((prev) => ({ ...prev, category_en: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>URL de imagen</Label>
                    <Input
                      value={form.image}
                      onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="https://ik.imagekit.io/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de publicación</Label>
                    <Input
                      type="datetime-local"
                      value={form.published_at}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, published_at: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Extracto (ES)</Label>
                    <Textarea
                      rows={3}
                      value={form.excerpt_es}
                      onChange={(e) => setForm((prev) => ({ ...prev, excerpt_es: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extracto (EN)</Label>
                    <Textarea
                      rows={3}
                      value={form.excerpt_en}
                      onChange={(e) => setForm((prev) => ({ ...prev, excerpt_en: e.target.value }))}
                    />
                  </div>
                  <BlogRichTextEditor
                    id="paragraphs-es"
                    label="Párrafos (ES)"
                    rows={8}
                    value={form.paragraphs_es}
                    onChange={(paragraphs_es) => setForm((prev) => ({ ...prev, paragraphs_es }))}
                    placeholder={"Párrafo 1\n\nPárrafo 2"}
                  />
                  <BlogRichTextEditor
                    id="paragraphs-en"
                    label="Párrafos (EN)"
                    rows={8}
                    value={form.paragraphs_en}
                    onChange={(paragraphs_en) => setForm((prev) => ({ ...prev, paragraphs_en }))}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSave} disabled={saving || !form.title_es.trim()}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Guardando…" : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={closeForm}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading && posts.length === 0 ? (
          <p className="text-sm text-slate-500">Cargando artículos…</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              No hay artículos en este filtro. Creá uno o ejecutá el SQL de seed en Supabase.
            </CardContent>
          </Card>
        ) : (
          filtered.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="hidden h-20 w-28 shrink-0 rounded-lg object-cover sm:block"
                    />
                  ) : null}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(post.status)}
                      <span className="text-xs text-slate-400">{post.category_es || "Sin categoría"}</span>
                    </div>
                    <h2 className="truncate font-bold text-slate-900">{post.title_es}</h2>
                    <p className="truncate text-xs text-slate-500">
                      /blog/{post.slug} · actualizado {formatUpdated(post.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.status === "published" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Ver
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                    <FilePenLine className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  {post.status !== "published" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setStatus(post.id, "published")}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Publicar
                    </Button>
                  )}
                  {post.status === "published" && (
                    <Button variant="outline" size="sm" onClick={() => setStatus(post.id, "draft")}>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Borrador
                    </Button>
                  )}
                  {post.status !== "archived" ? (
                    <Button variant="outline" size="sm" onClick={() => setStatus(post.id, "archived")}>
                      <Archive className="mr-1.5 h-3.5 w-3.5" />
                      Archivar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setStatus(post.id, "draft")}>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Restaurar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(post.id, post.title_es)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
