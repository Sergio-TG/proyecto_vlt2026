"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, Clock, AlertTriangle, Eye, 
  ExternalLink, ArrowRight, ShieldCheck, 
  Search, RefreshCcw, Lock, LogOut, Key, Mail, MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [authLoading, setAuthLoading] = React.useState(true)
  const [pendientes, setPendientes] = React.useState<any[]>([])
  const [aprobados, setAprobados] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingAprobados, setLoadingAprobados] = React.useState(true)
  const [approving, setApproving] = React.useState<string | null>(null)
  const [deletingApprovedId, setDeletingApprovedId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [approvedSearchTerm, setApprovedSearchTerm] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const checkAdminSession = async () => {
    setAuthLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    // El email del administrador configurado en .env
    const adminEmail = "sergiotg.web@gmail.com"
    
    if (session && session.user.email === adminEmail) {
      setIsAdmin(true)
      fetchPendientes()
      fetchAprobados()
    } else {
      setIsAdmin(false)
    }
    setAuthLoading(false)
  }

  React.useEffect(() => {
    checkAdminSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)

    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const adminEmail = "sergiotg.web@gmail.com"

    try {
      if (email !== adminEmail) {
        throw new Error("No tienes permisos para acceder a este panel.")
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (signInError) throw signInError
      
      setIsAdmin(true)
      fetchPendientes()
      fetchAprobados()
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  const fetchPendientes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alojamientos_pendientes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Error fetching pendientes:", error)
    } else {
      setPendientes(data || [])
    }
    setLoading(false)
  }

  const fetchAprobados = async () => {
    setLoadingAprobados(true)
    const { data, error } = await supabase
      .from("alojamientos_aprobados")
      .select("id, nombre, slug, localidad, created_at")
      .order("created_at", { ascending: false })
      .limit(40)

    if (error) {
      console.error("Error fetching aprobados:", error)
    } else {
      setAprobados(data || [])
    }
    setLoadingAprobados(false)
  }

  const handleDeleteAprobado = async (item: any) => {
    const confirmed = window.confirm(`Eliminar "${item.nombre}" (slug: ${item.slug}) de alojamientos_aprobados?`)
    if (!confirmed) return
    setDeletingApprovedId(item.id)
    try {
      const { error } = await supabase
        .from("alojamientos_aprobados")
        .delete()
        .eq("id", item.id)

      if (error) throw error
      await fetchAprobados()
    } catch (err: any) {
      alert(err?.message || "Error al eliminar el alojamiento aprobado")
    } finally {
      setDeletingApprovedId(null)
    }
  }

  const handleApprove = async (item: any) => {
    setApproving(item.id)
    try {
      // 1. Generar slug automáticamente si no existe o es inválido
      const baseName = item.nombre_complejo || "alojamiento-sin-nombre";
      const slug = baseName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-")
        .trim();

      const normalizeServicio = (value: string) => {
        const s = value.trim()
        if (/^(tipo|capacidad)\s*:/i.test(s)) return ""
        if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
        if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
        if (s === "Cochera cubierta") return "Cochera"
        if (s === "Pileta propia") return "Pileta"
        return s
      }

      const baseServicios = Array.isArray(item.servicios) ? item.servicios : []
      const servicios = Array.from(
        new Set(baseServicios.map((s: string) => normalizeServicio(s)).filter(Boolean))
      )

      if (item.mascotas === "Sí") {
        servicios.push("Pet Friendly")
      }

      const publicData = {
        nombre: item.nombre_complejo || "",
        slug: slug,
        descripcion: item.descripcion || "",
        servicios,
        localidad: item.localidad || "",
        precio_base: item.precio_desde ? Number(item.precio_desde) : null,
        noches_minimas: item.estadia_minima ? Number(item.estadia_minima) : 1,
        rating_google: item.rating_google || 4.5,
        tipo_alojamiento: item.tipo_alojamiento || null,
        capacidad_total: item.capacidad_total ? Number(item.capacidad_total) : null,
        mascotas: item.mascotas || null,
        acepta_ninos: item.acepta_ninos || null,
      }

      // 3. Upsert en alojamientos_aprobados (usando solo los campos permitidos)
      const { error: approveError } = await supabase
        .from('alojamientos_aprobados')
        .upsert(publicData, { onConflict: 'slug' })

      if (approveError) {
        console.error("Error detallado de Supabase:", {
          message: approveError.message,
          code: approveError.code,
          details: approveError.details,
          hint: approveError.hint
        });
        throw new Error(`${approveError.message}${approveError.hint ? ` - Hint: ${approveError.hint}` : ""}`);
      }

      // 4. Feedback y recarga
      alert(`¡${item.nombre_complejo} ha sido aprobado con éxito!`);
      fetchPendientes();
      
    } catch (err: any) {
      console.error("Error en proceso de aprobación:", err);
      const errorMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert("Error al aprobar: " + errorMessage)
    } finally {
      setApproving(null)
    }
  }

  const filteredItems = pendientes.filter(item => 
    item.nombre_complejo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.propietario?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAprobados = aprobados.filter((item) =>
    item.nombre?.toLowerCase().includes(approvedSearchTerm.toLowerCase()) ||
    item.slug?.toLowerCase().includes(approvedSearchTerm.toLowerCase()) ||
    item.localidad?.toLowerCase().includes(approvedSearchTerm.toLowerCase())
  )

  if (authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Acceso Admin</h1>
            <p className="text-slate-400 mt-2 font-medium">Solo personal autorizado</p>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white/70 text-xs font-bold uppercase tracking-widest">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input 
                    name="email"
                    type="email" 
                    required
                    placeholder="admin@vivilastermas.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 pl-10 rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-xs font-bold uppercase tracking-widest">Contraseña</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input 
                    name="password"
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 pl-10 rounded-xl focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={authLoading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {authLoading ? "Verificando..." : "Ingresar al Panel"}
              </Button>
            </form>
          </Card>

          <p className="text-center text-slate-500 mt-8 text-sm font-medium">
            &copy; 2026 Viví las Termas - Sistema de Gestión
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-primary" />
              Panel de Aprobación
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-500 font-medium">Gestiona los alojamientos que esperan ser publicados.</p>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold px-3">Admin</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nombre o dueño..." 
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchPendientes} disabled={loading} className="bg-white">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>

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
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-slate-900 font-black">{item.nombre}</p>
                        <p className="text-slate-500 font-medium text-sm">
                          {item.localidad} • <span className="font-mono text-xs">{item.slug}</span>
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        className="h-11 rounded-xl font-black"
                        onClick={() => handleDeleteAprobado(item)}
                        disabled={deletingApprovedId === item.id}
                      >
                        {deletingApprovedId === item.id ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando pendientes...</p>
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
                  <p className="text-slate-500 max-w-xs">Todos los registros han sido procesados o no hay nuevos ingresos.</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-slate-200 hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white">
                      <div className="flex flex-col lg:flex-row">
                        {/* Status Bar Vertical */}
                        <div className="w-2 bg-yellow-400 group-hover:bg-primary transition-colors" />
                        
                        <CardContent className="p-8 flex-grow">
                          <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4 flex-grow">
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                  Pendiente de Revisión
                                </Badge>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                  Registrado el {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div>
                                <h2 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                  {item.nombre_complejo}
                                </h2>
                                <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                  <MapPin className="w-4 h-4 text-primary" /> {item.localidad} • {item.tipo_alojamiento}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Propietario</p>
                                  <p className="text-sm font-bold text-slate-700">{item.propietario}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</p>
                                  <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                    {item.whatsapp} <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacidad</p>
                                  <p className="text-sm font-bold text-slate-700">{item.capacidad_total} personas ({item.unidades} unid.)</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 min-w-[200px]">
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
                              <a href={item.link_drive} target="_blank" className="w-full">
                                <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-sm border-slate-200 hover:bg-slate-50 gap-2">
                                  <Eye className="w-5 h-5 text-slate-400" />
                                  Ver Multimedia
                                </Button>
                              </a>
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descripción enviada:</h4>
                            <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">
                              "{item.descripcion}"
                            </p>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
