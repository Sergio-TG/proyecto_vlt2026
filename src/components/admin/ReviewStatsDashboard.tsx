"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BarChart3, Globe, MessageSquare, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { computeReviewStats, roundedAverageStars, type ReviewStats } from "@/lib/review-stats"
import { StarRatingDisplay } from "@/components/accommodations/StarRatingDisplay"

type AlojamientoOption = {
  id: string
  nombre: string
}

type StatsResponse = {
  ok?: boolean
  scope?: "global" | "alojamiento"
  alojamientoId?: string | null
  alojamientoNombre?: string | null
  stats?: ReviewStats
  alojamientos?: AlojamientoOption[]
  error?: string
  reason?: string
}

const EMPTY_STATS = computeReviewStats([])

type ReviewStatsDashboardProps = {
  token: string
  refreshKey?: number
}

export function ReviewStatsDashboard({ token, refreshKey = 0 }: ReviewStatsDashboardProps) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedAlojamientoId, setSelectedAlojamientoId] = React.useState<string>("")
  const [stats, setStats] = React.useState<ReviewStats>(EMPTY_STATS)
  const [scopeLabel, setScopeLabel] = React.useState("Todas las reseñas aprobadas")
  const [alojamientos, setAlojamientos] = React.useState<AlojamientoOption[]>([])

  React.useEffect(() => {
    let ignore = false

    async function loadStats() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (selectedAlojamientoId) {
          params.set("alojamientoId", selectedAlojamientoId)
        }

        const url = `/api/admin/reviews/stats${params.toString() ? `?${params.toString()}` : ""}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const json = (await res.json()) as StatsResponse

        if (json.reason === "missing_env") {
          throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
        }
        if (!res.ok || !json.ok || !json.stats) {
          throw new Error(json.error || "Error al cargar estadísticas de reseñas.")
        }

        if (ignore) return

        setStats(json.stats)
        setAlojamientos(json.alojamientos ?? [])

        if (json.scope === "alojamiento" && json.alojamientoNombre) {
          setScopeLabel(`Alojamiento: ${json.alojamientoNombre}`)
        } else {
          setScopeLabel("Todas las reseñas aprobadas")
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Error al cargar estadísticas"
          setError(message)
          setStats(EMPTY_STATS)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadStats()
    return () => {
      ignore = true
    }
  }, [token, selectedAlojamientoId, refreshKey])

  const avgAlojStars = roundedAverageStars(stats.promedioAlojamiento)
  const avgWebStars = roundedAverageStars(stats.promedioPlataforma)

  return (
    <section className="mb-10 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <BarChart3 className="h-6 w-6 text-primary" />
            Métricas de reseñas
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{scopeLabel}</p>
        </div>

        <div className="w-full md:max-w-sm">
          <Label htmlFor="stats-alojamiento" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Filtrar por alojamiento
          </Label>
          <select
            id="stats-alojamiento"
            value={selectedAlojamientoId}
            onChange={(e) => setSelectedAlojamientoId(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <option value="">Vista global (todas aprobadas)</option>
            {alojamientos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  Total de opiniones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-black text-slate-900">{stats.totalResenas}</p>
                <p className="mt-1 text-sm text-slate-500">Reseñas aprobadas en el alcance seleccionado</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="font-bold uppercase tracking-wider text-slate-400">
                  Puntuación promedio · Alojamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-slate-900">{stats.promedioAlojamientoLabel}</p>
                  {stats.promedioAlojamiento !== null ? (
                    <span className="mb-1 text-sm font-medium text-slate-400">/ 5</span>
                  ) : null}
                </div>
                {avgAlojStars > 0 ? (
                  <div className="mt-3">
                    <StarRatingDisplay value={avgAlojStars} sizeClass="h-5 w-5" />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">Sin datos suficientes</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400">
                  <Globe className="h-4 w-4" />
                  Satisfacción web Viví las Termas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-slate-900">{stats.promedioPlataformaLabel}</p>
                  {stats.promedioPlataforma !== null ? (
                    <span className="mb-1 text-sm font-medium text-slate-400">/ 5</span>
                  ) : null}
                </div>
                {avgWebStars > 0 ? (
                  <div className="mt-3">
                    <StarRatingDisplay value={avgWebStars} sizeClass="h-5 w-5" />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">Sin datos suficientes</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Star className="h-5 w-5 text-amber-400" />
                Distribución de estrellas (alojamiento)
              </CardTitle>
              <CardDescription className="font-medium text-slate-500">
                Porcentaje de huéspedes que votaron cada nivel de calificación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.distribucion.map((row) => (
                <div key={row.estrellas} className="grid grid-cols-[72px_1fr_56px] items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                    <span>{row.estrellas}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <Progress value={row.porcentaje} className="h-2.5 bg-slate-100" />
                  </div>
                  <div className="text-right text-xs font-semibold text-slate-500">
                    {stats.totalResenas > 0 ? `${Math.round(row.porcentaje)}%` : "0%"}
                    <span className="block text-[10px] font-medium text-slate-400">({row.conteo})</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  )
}
