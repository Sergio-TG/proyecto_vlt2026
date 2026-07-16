"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, Clock, AlertTriangle, Eye, 
  ExternalLink, ShieldCheck, 
  Search, RefreshCcw, LogOut, MapPin, Archive, RotateCcw, Trash2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { onlyActiveAlojamientos } from "@/lib/alojamientos-active"
import type { TrashAlojamientoRow } from "@/app/api/admin/trash/route"
import { BADGE_ADMIN_OPTIONS, normalizeBadgeDestacado } from "@/lib/accommodation-badges"
import type { CancelacionPolicy, DistribucionCamaItem } from "@/lib/supabase-queries"
import { serializeBedLayoutForCompare, serializeCancellationForCompare } from "@/lib/accommodation-i18n"

type PendingRow = {
  id: string
  user_id?: string | null
  slug?: string | null
  nombre_complejo?: string | null
  propietario?: string | null
  descripcion?: string | null
  descripcion_en?: string | null
  servicios?: unknown
  localidad?: string | null
  precio_desde?: unknown
  estadia_minima?: unknown
  tipo_alojamiento?: string | null
  whatsapp?: string | null
  capacidad_total?: unknown
  mascotas?: string | null
  acepta_ninos?: string | null
  link_drive?: string | null
  email?: string | null
  unidades?: string | null
  direccion?: string | null
  google_maps?: string | null
  latitud?: number | null
  longitud?: number | null
  distribucion_camas?: DistribucionCamaItem[] | unknown
  distancia_termas?: string | null
  tipo_acceso?: string | null
  check_in?: string | null
  check_out?: string | null
  cancelacion?: CancelacionPolicy | unknown
  perfiles?: unknown
  rating_google?: unknown
  badge_destacado?: string | null
  created_at?: string | null
}

type ApprovedRow = {
  id: string
  slug?: string | null
  nombre?: string | null
  descripcion?: string | null
  descripcion_en?: string | null
  servicios?: unknown
  localidad?: string | null
  precio_base?: unknown
  noches_minimas?: unknown
  rating_google?: unknown
  tipo_alojamiento?: string | null
  badge_destacado?: string | null
  whatsapp?: string | null
  capacidad_total?: unknown
  mascotas?: string | null
  acepta_ninos?: string | null
  link_drive?: string | null
  email_contacto?: string | null
  unidades?: string | null
  direccion?: string | null
  google_maps?: string | null
  latitud?: number | null
  longitud?: number | null
  propietario?: string | null
  distribucion_camas?: DistribucionCamaItem[] | unknown
  distancia_termas?: string | null
  tipo_acceso?: string | null
  check_in?: string | null
  check_out?: string | null
  cancelacion?: CancelacionPolicy | unknown
  perfiles?: unknown
  created_at?: string | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [authLoading, setAuthLoading] = React.useState(true)
  const [pendientes, setPendientes] = React.useState<PendingRow[]>([])
  const [aprobados, setAprobados] = React.useState<ApprovedRow[]>([])
  const [aprobadosBySlug, setAprobadosBySlug] = React.useState<Record<string, ApprovedRow>>({})
  const [loading, setLoading] = React.useState(true)
  const [loadingAprobados, setLoadingAprobados] = React.useState(true)
  const [approving, setApproving] = React.useState<string | null>(null)
  const [rejectingPendingId, setRejectingPendingId] = React.useState<string | null>(null)
  const [deletingApprovedId, setDeletingApprovedId] = React.useState<string | null>(null)
  const [trashItems, setTrashItems] = React.useState<TrashAlojamientoRow[]>([])
  const [loadingTrash, setLoadingTrash] = React.useState(false)
  const [restoringId, setRestoringId] = React.useState<string | null>(null)
  const [purgingId, setPurgingId] = React.useState<string | null>(null)
  const [cleaningDuplicates, setCleaningDuplicates] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [approvedSearchTerm, setApprovedSearchTerm] = React.useState("")
  const [pendingBadgeSelections, setPendingBadgeSelections] = React.useState<Record<string, string>>({})
  const [savingBadgeId, setSavingBadgeId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const toSlug = (value: string) => {
    return (value || "alojamiento-sin-nombre")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim()
  }

  const getPendingSlug = (item: PendingRow) => {
    if (typeof item?.slug === "string" && item.slug.trim().length > 0) return item.slug.trim()
    return toSlug(item?.nombre_complejo || "")
  }

  const normalizeServicioName = (value: string) => {
    const s = value.trim()
    if (s.length === 0) return null
    if (/^(tipo|capacidad)\s*:/i.test(s)) return null
    if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
    if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
    if (s === "Cochera cubierta") return "Cochera"
    if (s === "Pileta propia" || s === "Piscina") return "Pileta"
    if (s === "Acepta Mascotas") return "Pet Friendly"
    return s
  }

  const parseServiciosFromUnknown = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw.map((v) => String(v))
    if (typeof raw !== "string") return []
    const t = raw.trim()
    if (t.length === 0) return []
    if (t.startsWith("[") && t.endsWith("]")) {
      try {
        const parsed = JSON.parse(t)
        if (Array.isArray(parsed)) return parsed.map((v) => String(v))
      } catch {
      }
    }
    if (t.startsWith("{") && t.endsWith("}")) {
      const inner = t.slice(1, -1)
      return inner
        .split(",")
        .map((p) => p.trim().replace(/^"+|"+$/g, ""))
        .filter(Boolean)
    }
    return t
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
  }

  const getServiciosList = (raw: unknown) => {
    const list = parseServiciosFromUnknown(raw)
      .map(normalizeServicioName)
      .filter((s): s is string => Boolean(s))
    return Array.from(new Set(list))
  }

  const checkAdminSession = async () => {
    setAuthLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setIsAdmin(false)
      setAuthLoading(false)
      router.replace("/login?next=/admin")
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) {
      setIsAdmin(false)
      setAuthLoading(false)
      router.replace("/login?next=/admin")
      return
    }

    const res = await fetch("/api/admin/verify", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    const json = (await res?.json().catch(() => null)) as unknown
    const ok = Boolean(res?.ok) && Boolean((json as { ok?: boolean } | null)?.ok)
    if (ok) {
      setIsAdmin(true)
      fetchPendientes()
      fetchAprobados()
      fetchTrash()
    } else {
      setIsAdmin(false)
    }
    setAuthLoading(false)
  }

  React.useEffect(() => {
    checkAdminSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap de sesión al montar
  }, [])

  React.useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAdmin(false)
        router.replace("/login?next=/admin")
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    router.replace("/login")
  }

  const fetchPendientes = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        setPendientes([])
        setAprobadosBySlug({})
        setError("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const text = await res.text()
      const json = (() => {
        try {
          return text ? JSON.parse(text) : null
        } catch {
          return null
        }
      })()

      if (json?.reason === "missing_env") {
        const { data, error } = await supabase
          .from("alojamientos_pendientes")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) {
          console.error("Error fetching pendientes:", error)
          setPendientes([])
          setAprobadosBySlug({})
        } else {
          setPendientes(data || [])
          setAprobadosBySlug({})
        }
      } else if (!res.ok || !json?.ok) {
        const reason = json?.reason ? String(json.reason) : ""
        if (reason === "invalid_token" || reason === "missing_token") {
          setError("Tu sesión de Admin expiró. Cerrá sesión e iniciá sesión nuevamente.")
        } else if (reason === "forbidden") {
          setError("No tenés permisos para ver los pendientes.")
        } else if (reason) {
          setError(`Error al cargar pendientes (${reason}).`)
        } else {
          setError(`Error al cargar pendientes (status ${res.status}).`)
        }
        setPendientes([])
        setAprobadosBySlug({})
      } else {
        setPendientes(json.pendientes || [])
        setAprobadosBySlug(json.aprobadosBySlug || {})
      }
    } catch (err) {
      console.error("Error fetching pendientes:", err)
      setPendientes([])
      setAprobadosBySlug({})
    }
    setLoading(false)
  }

  const fetchAprobados = async () => {
    setLoadingAprobados(true)
    const { data, error } = await onlyActiveAlojamientos(
      supabase.from("alojamientos_aprobados").select("id, nombre, slug, localidad, created_at, badge_destacado"),
    )
      .order("created_at", { ascending: false })
      .limit(40)

    if (error) {
      console.error("Error fetching aprobados:", error)
    } else {
      setAprobados(data || [])
    }
    setLoadingAprobados(false)
  }

  const fetchTrash = async () => {
    setLoadingTrash(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        setTrashItems([])
        return
      }

      const res = await fetch("/api/admin/trash", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = (await res.json()) as {
        ok?: boolean
        items?: TrashAlojamientoRow[]
        error?: string
        reason?: string
      }

      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al cargar la papelera")
      }

      setTrashItems(json.items ?? [])
    } catch (err: unknown) {
      console.error("Error fetching trash:", err)
      setTrashItems([])
    } finally {
      setLoadingTrash(false)
    }
  }

  const handleRestoreAprobado = async (item: TrashAlojamientoRow) => {
    setRestoringId(item.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvedId: item.id }),
      })
      const json = await res.json()
      if (json?.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para restaurar.")
      }
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Error al restaurar")
      }

      setTrashItems((prev) => prev.filter((row) => row.id !== item.id))
      await fetchAprobados()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al restaurar el alojamiento"
      alert(message)
    } finally {
      setRestoringId(null)
    }
  }

  const handlePurgeAprobado = async (item: TrashAlojamientoRow) => {
    const nombre = item.nombre ?? "este alojamiento"
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente "${nombre}"?\n\nEsta acción no se puede deshacer y borrará todas las imágenes y datos asociados.`,
    )
    if (!confirmed) return

    setPurgingId(item.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const res = await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvedId: item.id }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; reason?: string }
      if (json.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para eliminar con privilegios.")
      }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al eliminar definitivamente")
      }

      setTrashItems((prev) => prev.filter((row) => row.id !== item.id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al eliminar definitivamente el alojamiento"
      alert(message)
    } finally {
      setPurgingId(null)
    }
  }

  const handleDeleteAprobado = async (item: ApprovedRow) => {
    const confirmed = window.confirm(
      `¿Archivar "${item.nombre}" (slug: ${item.slug})?\n\nDesaparecerá de la web pública pero podrás restaurarlo desde la Papelera.`,
    )
    if (!confirmed) return
    setDeletingApprovedId(item.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const pendingIds = (pendientes || [])
        .filter((p) => getPendingSlug(p) === item.slug)
        .map((p) => p?.id)
        .filter(Boolean)

      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvedId: item.id, pendingIds }),
      })
      const json = await res.json()
      if (json?.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para eliminar con privilegios.")
      }
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Error al eliminar (server)")
      }
      await fetchAprobados()
      await fetchPendientes()
      await fetchTrash()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al eliminar el alojamiento aprobado"
      alert(message)
    } finally {
      setDeletingApprovedId(null)
    }
  }

  const handleRejectPendiente = async (item: PendingRow) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas rechazar este alojamiento? Esta acción no se puede deshacer.\n\n${String(item.nombre_complejo || "").trim()}`
    )
    if (!confirmed) return

    setRejectingPendingId(item.id)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const res = await fetch("/api/admin/delete-pendings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pendingIds: [item.id] }),
      })

      const text = await res.text()
      const json = (() => {
        try {
          return text ? JSON.parse(text) : null
        } catch {
          return null
        }
      })() as { ok?: boolean; error?: string; reason?: string } | null

      if (json?.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para rechazar con privilegios.")
      }
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Error al rechazar (status ${res.status})`)
      }

      setPendientes((prev) => prev.filter((p) => p.id !== item.id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al rechazar el alojamiento pendiente"
      setError(message)
      alert(message)
    } finally {
      setRejectingPendingId(null)
    }
  }

  const getPendingBadgeValue = (item: PendingRow) => {
    const slug = getPendingSlug(item)
    const selected = pendingBadgeSelections[item.id]
    if (typeof selected !== "undefined") {
      return normalizeBadgeDestacado(selected)
    }
    return normalizeBadgeDestacado(aprobadosBySlug[slug]?.badge_destacado ?? item.badge_destacado)
  }

  const persistApprovedBadge = async (slug: string, badge_destacado: string | null) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) return

    await fetch("/api/admin/badge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, badge_destacado }),
    }).catch(() => null)
  }

  const persistApprovedI18nFields = async (item: PendingRow, slug: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) return

    const payload: Record<string, unknown> = { slug }
    if (String(item.descripcion_en ?? "").trim()) payload.descripcion_en = item.descripcion_en
    if (String(item.descripcion ?? "").trim()) payload.descripcion = item.descripcion
    if (typeof item.cancelacion !== "undefined") payload.cancelacion = item.cancelacion
    if (typeof item.distribucion_camas !== "undefined") payload.distribucion_camas = item.distribucion_camas

    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payload }),
    }).catch(() => null)
  }

  const handleApprovedBadgeChange = async (item: ApprovedRow, value: string) => {
    setSavingBadgeId(item.id)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const badge_destacado = normalizeBadgeDestacado(value)
      const res = await fetch("/api/admin/badge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: item.id, badge_destacado }),
      })
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; reason?: string } | null

      if (json?.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.")
      }
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "No se pudo guardar el badge.")
      }

      setAprobados((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, badge_destacado } : row)),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar el badge."
      setError(message)
      alert(message)
    } finally {
      setSavingBadgeId(null)
    }
  }

  const handleApprove = async (item: PendingRow) => {
    setApproving(item.id)
    try {
      const slug = toSlug(item.nombre_complejo || "")
      const badge_destacado = getPendingBadgeValue(item)
      const rating =
        typeof item.rating_google !== "undefined" && item.rating_google !== null && item.rating_google !== ""
          ? Number(item.rating_google)
          : 4.5

      const { error: rpcError } = await supabase.rpc("aprobar_alojamiento", {
        pendiente_id: item.id,
        nuevo_slug: slug,
        rating,
      })

      if (!rpcError) {
        await persistApprovedBadge(slug, badge_destacado)
        await persistApprovedI18nFields(item, slug)
        alert(`¡${item.nombre_complejo} ha sido aprobado con éxito!`)
        fetchAprobados()
        fetchPendientes()
        fetchTrash()
        return
      }

      const normalizeServicio = (value: string) => {
        const s = value.trim()
        if (/^(tipo|capacidad)\s*:/i.test(s)) return ""
        if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
        if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
        if (s === "Cochera cubierta") return "Cochera"
        if (s === "Pileta propia") return "Pileta"
        if (s === "Piscina") return "Pileta"
        return s
      }

      const baseServicios = Array.isArray(item.servicios) ? item.servicios : []
      const servicios = Array.from(new Set(baseServicios.map((s: string) => normalizeServicio(s)).filter(Boolean)))
      if (item.mascotas === "Sí") servicios.push("Pet Friendly")

      const payload: Record<string, unknown> = {
        nombre: item.nombre_complejo || "",
        slug,
        descripcion: item.descripcion || "",
        descripcion_en: item.descripcion_en || "",
        servicios,
        localidad: item.localidad || "",
        precio_base: item.precio_desde ? Number(item.precio_desde) : null,
        noches_minimas: item.estadia_minima ? Number(item.estadia_minima) : 1,
        rating_google: item.rating_google || 4.5,
        badge_destacado,
      }

      if (typeof item.user_id !== "undefined") payload.user_id = item.user_id
      if (item.tipo_alojamiento) payload.tipo_alojamiento = item.tipo_alojamiento
      if (typeof item.capacidad_total !== "undefined" && item.capacidad_total !== null && item.capacidad_total !== "") {
        payload.capacidad_total = Number(item.capacidad_total)
      }
      if (typeof item.mascotas !== "undefined") payload.mascotas = item.mascotas
      if (typeof item.acepta_ninos !== "undefined") payload.acepta_ninos = item.acepta_ninos
      if (typeof item.whatsapp !== "undefined") payload.whatsapp = item.whatsapp
      if (typeof item.link_drive !== "undefined") payload.link_drive = item.link_drive
      if (typeof item.email !== "undefined") payload.email_contacto = item.email
      if (typeof item.unidades !== "undefined") payload.unidades = item.unidades
      if (typeof item.direccion !== "undefined") payload.direccion = item.direccion
      if (typeof item.google_maps !== "undefined") payload.google_maps = item.google_maps
      if (typeof item.latitud !== "undefined") payload.latitud = item.latitud
      if (typeof item.longitud !== "undefined") payload.longitud = item.longitud
      if (typeof item.propietario !== "undefined") payload.propietario = item.propietario
      if (typeof item.distribucion_camas !== "undefined") payload.distribucion_camas = item.distribucion_camas
      if (typeof item.distancia_termas !== "undefined") payload.distancia_termas = item.distancia_termas
      if (typeof item.tipo_acceso !== "undefined") payload.tipo_acceso = item.tipo_acceso
      if (typeof item.perfiles !== "undefined") payload.perfiles = item.perfiles
      if (typeof item.check_in !== "undefined") payload.check_in = item.check_in
      if (typeof item.check_out !== "undefined") payload.check_out = item.check_out
      if (typeof item.cancelacion !== "undefined") payload.cancelacion = item.cancelacion

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) {
        throw new Error("Sesión inválida o expirada. Volvé a iniciar sesión en el panel de Admin.")
      }

      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payload, pendingId: item.id }),
      })
      const json = await res.json()
      if (json?.reason === "missing_env") {
        throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para aprobar con privilegios.")
      }
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Error al aprobar (server)")
      }

      alert(`¡${item.nombre_complejo} ha sido aprobado con éxito!`)
      fetchAprobados()
      fetchPendientes()
      fetchTrash()
    } catch (err: unknown) {
      console.error("Error en proceso de aprobación:", err)
      const errorMessage = err instanceof Error ? err.message : (typeof err === "object" ? JSON.stringify(err) : String(err))
      alert("Error al aprobar: " + errorMessage)
    } finally {
      setApproving(null)
    }
  }

  const approvedSlugSet = React.useMemo(() => {
    return new Set((aprobados || []).map((a) => a?.slug).filter(Boolean))
  }, [aprobados])

  // ✅ CORREGIDO: ahora compara TODOS los campos relevantes
  const isPendingSyncedWithApproved = (pending: PendingRow) => {
    const slug = getPendingSlug(pending)
    const approved = aprobadosBySlug[slug]
    if (!approved) return false

    // Servicios
    const pendingServicios = getServiciosList(pending?.servicios)
    const approvedServicios = getServiciosList(approved?.servicios)
    if (pendingServicios.join("|") !== approvedServicios.join("|")) return false

    // Descripción
    if (String(pending?.descripcion || "").trim() !== String(approved?.descripcion || "").trim()) return false
    if (String(pending?.descripcion_en || "").trim() !== String(approved?.descripcion_en || "").trim()) return false

    // Localidad
    if (String(pending?.localidad || "").trim() !== String(approved?.localidad || "").trim()) return false

    // Precio
    const pendingPrecio =
      pending?.precio_desde != null && pending?.precio_desde !== "" ? Number(pending.precio_desde) : null
    const approvedPrecio =
      approved?.precio_base != null && approved?.precio_base !== "" ? Number(approved.precio_base) : null
    const precioEqual =
      (pendingPrecio === null && approvedPrecio === null) ||
      (pendingPrecio !== null && approvedPrecio !== null && pendingPrecio === approvedPrecio)
    if (!precioEqual) return false

    // Estadía mínima
    const pendingMin =
      pending?.estadia_minima != null && pending?.estadia_minima !== "" ? Number(pending.estadia_minima) : 1
    const approvedMin =
      approved?.noches_minimas != null && approved?.noches_minimas !== "" ? Number(approved.noches_minimas) : 1
    if (pendingMin !== approvedMin) return false

    // Nombre
    if (String(pending?.nombre_complejo || "").trim() !== String(approved?.nombre || "").trim()) return false

    // Tipo de alojamiento
    if (String(pending?.tipo_alojamiento || "").trim() !== String(approved?.tipo_alojamiento || "").trim()) return false

    // WhatsApp
    if (String(pending?.whatsapp || "").trim() !== String(approved?.whatsapp || "").trim()) return false

    // Capacidad
    const pendingCap =
      pending?.capacidad_total != null && pending?.capacidad_total !== "" ? Number(pending.capacidad_total) : null
    const approvedCap =
      approved?.capacidad_total != null && approved?.capacidad_total !== "" ? Number(approved.capacidad_total) : null
    if (pendingCap !== approvedCap) return false

    // Mascotas
    if (String(pending?.mascotas || "").trim() !== String(approved?.mascotas || "").trim()) return false

    // Acepta niños
    if (String(pending?.acepta_ninos || "").trim() !== String(approved?.acepta_ninos || "").trim()) return false

    // Link Drive / Multimedia
    const pendingDrive = String(pending?.link_drive || "").trim()
    const approvedDrive = String(approved?.link_drive || "").trim()
    if (pendingDrive && pendingDrive !== approvedDrive) return false

    // Email
    if (String(pending?.email || "").trim() !== String(approved?.email_contacto || "").trim()) return false

    // Unidades
    if (String(pending?.unidades || "").trim() !== String(approved?.unidades || "").trim()) return false

    // Direccion
    if (String(pending?.direccion || "").trim() !== String(approved?.direccion || "").trim()) return false

    // Google Maps
    if (String(pending?.google_maps || "").trim() !== String(approved?.google_maps || "").trim()) return false
    if (Number(pending?.latitud ?? NaN) !== Number(approved?.latitud ?? NaN)) return false
    if (Number(pending?.longitud ?? NaN) !== Number(approved?.longitud ?? NaN)) return false

    // Propietario
    if (String(pending?.propietario || "").trim() !== String(approved?.propietario || "").trim()) return false

    // Distribucion Camas
    if (serializeBedLayoutForCompare(pending?.distribucion_camas) !== serializeBedLayoutForCompare(approved?.distribucion_camas)) return false

    // Distancia Termas
    if (String(pending?.distancia_termas || "").trim() !== String(approved?.distancia_termas || "").trim()) return false

    // Tipo Acceso
    if (String(pending?.tipo_acceso || "").trim() !== String(approved?.tipo_acceso || "").trim()) return false

    // Check In
    if (String(pending?.check_in || "").trim() !== String(approved?.check_in || "").trim()) return false

    // Check Out
    if (String(pending?.check_out || "").trim() !== String(approved?.check_out || "").trim()) return false

    // Cancelacion
    if (serializeCancellationForCompare(pending?.cancelacion) !== serializeCancellationForCompare(approved?.cancelacion)) return false

    // Perfiles
    const pendingPerfiles = Array.isArray(pending?.perfiles) ? pending.perfiles : []
    const approvedPerfiles = Array.isArray(approved?.perfiles) ? approved.perfiles : []
    if (pendingPerfiles.sort().join("|") !== approvedPerfiles.sort().join("|")) return false;

    return true
  }

  // ✅ CORREGIDO: ahora muestra todos los campos que cambiaron
  const getPendingChangeSummary = (pending: PendingRow) => {
    const slug = getPendingSlug(pending)
    const approved = aprobadosBySlug[slug]
    if (!approved) return []

    const changes: string[] = []

    // Servicios
    const pendingServicios = getServiciosList(pending?.servicios)
    const approvedServicios = getServiciosList(approved?.servicios)
    const added = pendingServicios.filter((s) => !approvedServicios.includes(s))
    const removed = approvedServicios.filter((s) => !pendingServicios.includes(s))
    if (added.length > 0) changes.push(`Servicios +${added.length}`)
    if (removed.length > 0) changes.push(`Servicios -${removed.length}`)

    // Descripción
    if (String(pending?.descripcion || "").trim() !== String(approved?.descripcion || "").trim())
      changes.push("Descripción")
    if (String(pending?.descripcion_en || "").trim() !== String(approved?.descripcion_en || "").trim())
      changes.push("Descripción (EN)")

    // Localidad
    if (String(pending?.localidad || "").trim() !== String(approved?.localidad || "").trim())
      changes.push("Localidad")

    // Precio
    const pendingPrecio =
      pending?.precio_desde != null && pending?.precio_desde !== "" ? Number(pending.precio_desde) : null
    const approvedPrecio =
      approved?.precio_base != null && approved?.precio_base !== "" ? Number(approved.precio_base) : null
    if (pendingPrecio !== approvedPrecio) changes.push("Precio")

    // Estadía mínima
    const pendingMin =
      pending?.estadia_minima != null && pending?.estadia_minima !== "" ? Number(pending.estadia_minima) : 1
    const approvedMin =
      approved?.noches_minimas != null && approved?.noches_minimas !== "" ? Number(approved.noches_minimas) : 1
    if (pendingMin !== approvedMin) changes.push("Estadía mín.")

    // Nombre
    if (String(pending?.nombre_complejo || "").trim() !== String(approved?.nombre || "").trim())
      changes.push("Nombre")

    // Tipo de alojamiento
    if (String(pending?.tipo_alojamiento || "").trim() !== String(approved?.tipo_alojamiento || "").trim())
      changes.push("Tipo")

    // WhatsApp
    if (String(pending?.whatsapp || "").trim() !== String(approved?.whatsapp || "").trim())
      changes.push("WhatsApp")

    // Capacidad
    const pendingCap =
      pending?.capacidad_total != null && pending?.capacidad_total !== "" ? Number(pending.capacidad_total) : null
    const approvedCap =
      approved?.capacidad_total != null && approved?.capacidad_total !== "" ? Number(approved.capacidad_total) : null
    if (pendingCap !== approvedCap) changes.push("Capacidad")

    // Mascotas
    if (String(pending?.mascotas || "").trim() !== String(approved?.mascotas || "").trim())
      changes.push("Mascotas")

    // Acepta niños
    if (String(pending?.acepta_ninos || "").trim() !== String(approved?.acepta_ninos || "").trim())
      changes.push("Acepta niños")

    // Link Drive / Multimedia
    const pendingDrive = String(pending?.link_drive || "").trim()
    const approvedDrive = String(approved?.link_drive || "").trim()
    if (pendingDrive && pendingDrive !== approvedDrive) changes.push("Multimedia")

    // Email
    if (String(pending?.email || "").trim() !== String(approved?.email_contacto || "").trim())
      changes.push("Email")

    // Unidades
    if (String(pending?.unidades || "").trim() !== String(approved?.unidades || "").trim())
      changes.push("Unidades")

    // Direccion
    if (String(pending?.direccion || "").trim() !== String(approved?.direccion || "").trim())
      changes.push("Dirección")

    // Google Maps
    if (String(pending?.google_maps || "").trim() !== String(approved?.google_maps || "").trim())
      changes.push("Google Maps")
    if (Number(pending?.latitud ?? NaN) !== Number(approved?.latitud ?? NaN))
      changes.push("Latitud")
    if (Number(pending?.longitud ?? NaN) !== Number(approved?.longitud ?? NaN))
      changes.push("Longitud")

    // Propietario
    if (String(pending?.propietario || "").trim() !== String(approved?.propietario || "").trim())
      changes.push("Propietario")

    // Distribucion Camas
    if (serializeBedLayoutForCompare(pending?.distribucion_camas) !== serializeBedLayoutForCompare(approved?.distribucion_camas))
      changes.push("Camas")

    // Distancia Termas
    if (String(pending?.distancia_termas || "").trim() !== String(approved?.distancia_termas || "").trim())
      changes.push("Dist. Termas")

    // Tipo Acceso
    if (String(pending?.tipo_acceso || "").trim() !== String(approved?.tipo_acceso || "").trim())
      changes.push("Acceso")

    // Check In
    if (String(pending?.check_in || "").trim() !== String(approved?.check_in || "").trim())
      changes.push("Check-in")

    // Check Out
    if (String(pending?.check_out || "").trim() !== String(approved?.check_out || "").trim())
      changes.push("Check-out")

    // Cancelacion
    if (serializeCancellationForCompare(pending?.cancelacion) !== serializeCancellationForCompare(approved?.cancelacion))
      changes.push("Cancelación")

    // Perfiles
    const pendingPerfiles = Array.isArray(pending?.perfiles) ? pending.perfiles : [];
    const approvedPerfiles = Array.isArray(approved?.perfiles) ? approved.perfiles : [];
    if (pendingPerfiles.sort().join("|") !== approvedPerfiles.sort().join("|"))
      changes.push("Perfiles")

    return changes
  }

  const duplicatePendingCount = React.useMemo(() => {
    return (pendientes || []).filter((p) => isPendingSyncedWithApproved(p)).length
  }, [aprobadosBySlug, pendientes])

  const handleCleanDuplicates = async () => {
    const duplicateIds = (pendientes || [])
      .filter((p) => isPendingSyncedWithApproved(p))
      .map((p) => p?.id)
      .filter(Boolean)

    if (duplicateIds.length === 0) {
      alert("No se encontraron pendientes duplicados para limpiar.")
      return
    }

    const confirmed = window.confirm(
      `Se van a eliminar ${duplicateIds.length} registros de "alojamientos_pendientes" que ya están sincronizados con "alojamientos_aprobados" (sin cambios pendientes). ¿Continuar?`
    )
    if (!confirmed) return

    setCleaningDuplicates(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      for (let i = 0; i < duplicateIds.length; i += 100) {
        const chunk = duplicateIds.slice(i, i + 100)
        
        const res = await fetch("/api/admin/delete-pendings", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ pendingIds: chunk }),
        })
        
        const json = await res.json()
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Error al eliminar duplicados en el servidor")
        }
      }
      await fetchPendientes()
      alert("Pendientes duplicados eliminados correctamente.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al limpiar pendientes duplicados"
      alert(message)
    } finally {
      setCleaningDuplicates(false)
    }
  }

  const filteredItems = pendientes
    .filter(
      (item) =>
        item.nombre_complejo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.propietario?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => !isPendingSyncedWithApproved(item))

  const duplicatePendingItems = React.useMemo(() => {
    return (pendientes || []).filter((p) => isPendingSyncedWithApproved(p))
  }, [aprobadosBySlug, pendientes])

  const filteredAprobados = aprobados.filter(
    (item) =>
      item.nombre?.toLowerCase().includes(approvedSearchTerm.toLowerCase()) ||
      item.slug?.toLowerCase().includes(approvedSearchTerm.toLowerCase()) ||
      item.localidad?.toLowerCase().includes(approvedSearchTerm.toLowerCase())
  )

  if (authLoading && !isAdmin) {
    return (
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 flex min-h-[calc(100dvh-7.5rem)] flex-col items-center justify-center bg-slate-900 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 flex min-h-[calc(100dvh-7.5rem)] flex-col items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Sin permisos de Admin</h1>
            <p className="text-sm font-medium text-slate-400">
              Tu sesión está activa, pero no tenés acceso a este panel.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="secondary" className="font-bold">
              <Link href="/socios/portal">Ir al portal de socios</Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 font-bold">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 mb-8 md:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 sm:gap-3 sm:text-3xl lg:text-4xl">
              <ShieldCheck className="h-8 w-8 shrink-0 text-primary sm:h-10 sm:w-10" />
              <span className="leading-tight">Panel de Aprobación</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-sm font-medium text-slate-500 sm:text-base">
                Gestiona los alojamientos que esperan ser publicados.
              </p>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold px-3">
                Admin
              </Badge>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-2xl lg:justify-end">
            <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o dueño..."
                className="border-slate-200 bg-white pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={fetchPendientes} disabled={loading} className="bg-white" title="Actualizar">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="sr-only">Actualizar</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCleanDuplicates}
              disabled={cleaningDuplicates || loading || loadingAprobados || duplicatePendingCount === 0}
              className="bg-white text-xs font-bold sm:text-sm"
            >
              {cleaningDuplicates
                ? "Limpiando..."
                : `Duplicados${duplicatePendingCount > 0 ? ` (${duplicatePendingCount})` : ""}`}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 font-bold text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-bold">
            {error}
          </div>
        )}

        <Card className="border-slate-200 bg-white mb-10 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-slate-900 font-black">Alojamientos Aprobados</CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Eliminación de registros (solo Admin)
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre, slug o localidad..."
                    className="pl-10 bg-white border-slate-200"
                    value={approvedSearchTerm}
                    onChange={(e) => setApprovedSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={fetchAprobados} disabled={loadingAprobados} className="bg-white">
                  <RefreshCcw className={`w-4 h-4 ${loadingAprobados ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAprobados ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAprobados.length === 0 ? (
                  <div className="p-8 text-slate-500 font-medium">No hay resultados.</div>
                ) : (
                  filteredAprobados.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 p-4 sm:p-6 lg:flex-row lg:items-center"
                    >
                      <div className="space-y-1 flex-grow">
                        <p className="text-slate-900 font-black">{item.nombre}</p>
                        <p className="text-slate-500 font-medium text-sm">
                          {item.localidad} • <span className="font-mono text-xs">{item.slug}</span>
                        </p>
                        <div className="pt-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                            Badge de marketing
                          </label>
                          <select
                            value={item.badge_destacado ?? ""}
                            onChange={(e) => handleApprovedBadgeChange(item, e.target.value)}
                            disabled={savingBadgeId === item.id}
                            className="h-10 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {BADGE_ADMIN_OPTIONS.map((opt) => (
                              <option key={opt.value || "none"} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        className="h-11 w-full shrink-0 rounded-xl font-black gap-2 lg:w-auto"
                        onClick={() => handleDeleteAprobado(item)}
                        disabled={deletingApprovedId === item.id}
                      >
                        <Archive className="w-4 h-4" />
                        {deletingApprovedId === item.id ? "Archivando..." : "Archivar"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white mb-10 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900 font-black">
                  <Archive className="w-5 h-5 text-slate-500" />
                  Papelera de alojamientos
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Alojamientos archivados (borrado lógico). Restaurá uno para volver a publicarlo o eliminálo definitivamente.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={fetchTrash} disabled={loadingTrash} className="bg-white">
                <RefreshCcw className={`w-4 h-4 ${loadingTrash ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTrash ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : trashItems.length === 0 ? (
              <div className="p-8 text-slate-500 font-medium">La papelera está vacía.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {trashItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 p-4 sm:p-6 lg:flex-row lg:items-center"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-slate-900 font-black">{item.nombre ?? "Sin nombre"}</p>
                      <p className="text-slate-500 font-medium text-sm">
                        {item.localidad ?? "—"} • <span className="font-mono text-xs">{item.slug}</span>
                      </p>
                      {item.deleted_at ? (
                        <p className="text-xs text-slate-400">
                          Archivado: {new Date(item.deleted_at).toLocaleString("es-AR")}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl font-bold gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleRestoreAprobado(item)}
                        disabled={restoringId === item.id || purgingId === item.id}
                      >
                        <RotateCcw className="w-4 h-4" />
                        {restoringId === item.id ? "Restaurando..." : "Restaurar"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-11 rounded-xl font-black gap-2 bg-red-600 hover:bg-red-700"
                        onClick={() => handlePurgeAprobado(item)}
                        disabled={purgingId === item.id || restoringId === item.id}
                      >
                        <Trash2 className="w-4 h-4" />
                        {purgingId === item.id ? "Eliminando..." : "Eliminar definitivamente"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
              Cargando pendientes...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredItems.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-transparent py-20">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No hay alojamientos pendientes</h3>
                  <p className="text-slate-500 max-w-xs">
                    Todos los registros han sido procesados o no hay nuevos ingresos.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredItems.map((item) => {
                  const slug = getPendingSlug(item)
                  const isUpdateRequest = Boolean(aprobadosBySlug[slug])
                  const changeSummary = isUpdateRequest ? getPendingChangeSummary(item) : []

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-slate-200 hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white">
                        <div className="flex flex-col lg:flex-row">
                          <div
                            className={`w-2 ${isUpdateRequest ? "bg-blue-500" : "bg-yellow-400"} group-hover:bg-primary transition-colors`}
                          />
                          <CardContent className="flex-grow p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:gap-8">
                              <div className="space-y-4 flex-grow">
                                <div className="flex flex-wrap items-center gap-3">
                                  <Badge
                                    className={`${
                                      isUpdateRequest
                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                    } border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}
                                  >
                                    {isUpdateRequest ? "Actualización solicitada" : "Pendiente de Revisión"}
                                  </Badge>
                                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                    Registrado el {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>

                                {isUpdateRequest && changeSummary.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    {changeSummary.map((c) => (
                                      <Badge
                                        key={c}
                                        variant="outline"
                                        className="bg-slate-50 text-slate-700 border-slate-200 font-bold text-[10px] uppercase tracking-wider"
                                      >
                                        {c}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <div>
                                  <h2 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                    {item.nombre_complejo}
                                  </h2>
                                  <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-4 h-4 text-primary" /> {item.localidad} •{" "}
                                    {item.tipo_alojamiento}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      Propietario
                                    </p>
                                    <p className="text-sm font-bold text-slate-700">{item.propietario}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      WhatsApp
                                    </p>
                                    <a
                                      href={`https://wa.me/${item.whatsapp}`}
                                      target="_blank"
                                      className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                      {item.whatsapp} <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      Capacidad
                                    </p>
                                    <p className="text-sm font-bold text-slate-700">
                                      {String(item.capacidad_total || 0)} personas ({item.unidades || 0} unid.)
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 min-w-[200px]">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Badge de marketing
                                  </label>
                                  <select
                                    value={
                                      pendingBadgeSelections[item.id] ??
                                      aprobadosBySlug[slug]?.badge_destacado ??
                                      item.badge_destacado ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      setPendingBadgeSelections((prev) => ({
                                        ...prev,
                                        [item.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                                  >
                                    {BADGE_ADMIN_OPTIONS.map((opt) => (
                                      <option key={opt.value || "none"} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <Button
                                  className="w-full h-12 rounded-xl font-black text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2"
                                  onClick={() => handleApprove(item)}
                                  disabled={approving === item.id}
                                >
                                  {approving === item.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                                  ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                  )}
                                  Aprobar para Web
                                </Button>
                                <a href={item.link_drive || undefined} target="_blank" className="w-full">
                                  <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-bold text-sm border-slate-200 hover:bg-slate-50 gap-2"
                                  >
                                    <Eye className="w-5 h-5 text-slate-400" />
                                    Ver Multimedia
                                  </Button>
                                </a>
                                <Button
                                  variant="outline"
                                  className="w-full h-12 rounded-xl font-black text-sm border-red-200 text-red-600 hover:bg-red-50 gap-2"
                                  onClick={() => handleRejectPendiente(item)}
                                  disabled={rejectingPendingId === item.id || approving === item.id}
                                >
                                  {rejectingPendingId === item.id ? "Rechazando..." : "Rechazar"}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                Descripción enviada:
                              </h4>
                              <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">
                                &quot;{item.descripcion}&quot;
                              </p>
                              {String(item.descripcion_en || "").trim() ? (
                                <p className="text-sm text-slate-500 line-clamp-2 italic leading-relaxed mt-2">
                                  EN: &quot;{item.descripcion_en}&quot;
                                </p>
                              ) : null}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}

            {filteredItems.length === 0 && duplicatePendingItems.length > 0 && (
              <Card className="border-slate-200 bg-white">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900 font-black">
                    Registros duplicados ({duplicatePendingItems.length})
                  </CardTitle>
                  <CardDescription className="font-medium text-slate-500">
                    Estos registros están en “pendientes” pero no tienen cambios respecto a lo aprobado, por eso no requieren acción.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100">
                  {duplicatePendingItems.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-slate-900 font-black truncate">{item.nombre_complejo}</p>
                        <p className="text-slate-500 font-medium text-sm truncate">
                          {item.localidad} • <span className="font-mono text-xs">{getPendingSlug(item)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="h-11 rounded-xl font-bold"
                          onClick={() => {
                            alert(
                              "Este registro no tiene diferencias respecto al aprobado. Si esperabas ver cambios aquí, es porque el Portal de Socios no guardó esos cambios en la tabla de pendientes."
                            )
                          }}
                        >
                          Ver motivo
                        </Button>
                      </div>
                    </div>
                  ))}
                  {duplicatePendingItems.length > 10 && (
                    <div className="p-6 text-slate-500 font-medium">
                      Mostrando 10 de {duplicatePendingItems.length}. Podés usar “Limpiar duplicados” para eliminarlos.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
