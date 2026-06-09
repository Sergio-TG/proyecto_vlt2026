"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  MessageSquareQuote,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import type { ReviewPendingModeration } from "@/lib/reviews"
import { StarRatingDisplay } from "@/components/accommodations/StarRatingDisplay"
import { ReviewPhotosPreview } from "@/components/accommodations/ReviewPhotosGallery"
import { ReviewStatsDashboard } from "@/components/admin/ReviewStatsDashboard"

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })
}

export default function AdminReviewsPage() {
  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [reviews, setReviews] = React.useState<ReviewPendingModeration[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [approvingId, setApprovingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [statsRefreshKey, setStatsRefreshKey] = React.useState(0)

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

  const fetchPendingReviews = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = (await res.json()) as {
        ok?: boolean
        reviews?: ReviewPendingModeration[]
        error?: string
        reason?: string
      }

      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Error al cargar reseñas (${res.status})`)
      }

      setReviews(json.reviews ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar reseñas pendientes"
      setError(message)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (isAdmin && token) {
      fetchPendingReviews()
    }
  }, [isAdmin, token, fetchPendingReviews])

  const handleApprove = async (reviewId: string) => {
    if (!token) return
    setApprovingId(reviewId)
    setError(null)

    try {
      const res = await fetch("/api/admin/reviews/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewId }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; reason?: string }

      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al aprobar la reseña")
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setStatsRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al aprobar la reseña"
      setError(message)
    } finally {
      setApprovingId(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!token) return
    const confirmed = window.confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")
    if (!confirmed) return

    setDeletingId(reviewId)
    setError(null)

    try {
      const res = await fetch("/api/admin/reviews/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewId }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; reason?: string }

      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al eliminar la reseña")
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setStatsRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al eliminar la reseña"
      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-32">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4">
        <Lock className="mb-4 h-12 w-12 text-primary" />
        <p className="mb-6 text-lg font-medium text-white">Acceso restringido a administradores</p>
        <Button asChild>
          <Link href="/admin">Ir al panel de Admin</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>
            <h1 className="flex items-center gap-3 text-4xl font-black text-slate-900">
              <MessageSquareQuote className="h-10 w-10 text-primary" />
              Moderación de Reseñas
            </h1>
            <p className="font-medium text-slate-500">
              Revisá y aprobá las opiniones de los huéspedes antes de publicarlas en la web.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/10 bg-primary/5 px-3 font-bold text-primary">
              {reviews.length} pendiente{reviews.length === 1 ? "" : "s"}
            </Badge>
            <Button variant="outline" onClick={fetchPendingReviews} disabled={loading} className="bg-white">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {token ? <ReviewStatsDashboard token={token} refreshKey={statsRefreshKey} /> : null}

        <Card className="overflow-hidden border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 font-black text-slate-900">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Reseñas pendientes de aprobación
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Solo las reseñas aprobadas serán visibles en la ficha pública del alojamiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="px-6 py-16 text-center font-medium text-slate-500">
                No hay reseñas pendientes de moderación.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Turista</th>
                      <th className="px-6 py-4">Alojamiento</th>
                      <th className="px-6 py-4">Estrellas</th>
                      <th className="px-6 py-4">Comentario / Fotos</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {reviews.map((review) => (
                        <motion.tr
                          key={review.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -24, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="border-b border-slate-100 align-top"
                        >
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-900">{review.nombre_usuario}</p>
                            <p className="mt-1 text-xs font-medium text-slate-400">{formatDate(review.created_at)}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="max-w-[180px] font-semibold text-slate-700">
                              {review.alojamiento_nombre || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Alojamiento
                                </p>
                                <StarRatingDisplay value={review.estrellas_alojamiento} />
                              </div>
                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Web
                                </p>
                                <StarRatingDisplay value={review.estrellas_plataforma} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                              {review.comentario?.trim() || "—"}
                            </p>
                            <ReviewPhotosPreview urls={review.fotos} />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Button
                                className="h-10 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                                onClick={() => handleApprove(review.id)}
                                disabled={approvingId === review.id || deletingId === review.id}
                              >
                                {approvingId === review.id ? (
                                  "Aprobando..."
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Aprobar
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                className="h-10 rounded-xl font-bold"
                                onClick={() => handleDelete(review.id)}
                                disabled={approvingId === review.id || deletingId === review.id}
                              >
                                {deletingId === review.id ? (
                                  "Eliminando..."
                                ) : (
                                  <>
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Eliminar
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
