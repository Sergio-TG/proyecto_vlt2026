"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  User, Home, MapPin, ListChecks, Image as ImageIcon, ShieldCheck, 
  Check, ArrowRight, ArrowLeft, Info, AlertTriangle, 
  ChevronRight, Instagram, Globe, MessageCircle, Lock, Mail, Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const steps = [
  { id: 1, title: "Identidad", icon: User },
  { id: 2, title: "Ficha Técnica", icon: Home },
  { id: 3, title: "Logística", icon: MapPin },
  { id: 4, title: "Servicios", icon: ListChecks },
  { id: 5, title: "Multimedia", icon: ImageIcon },
  { id: 6, title: "Acuerdo", icon: ShieldCheck },
]

export default function SociosPage() {
  const [view, setView] = React.useState<"auth" | "form" | "success" | "dashboard">("auth")
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [editingAccommodation, setEditingAccommodation] = React.useState<any | null>(null)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    // Sección 1: Identidad
    propietario: "",
    whatsapp: "",
    email: "",
    nombreComplejo: "",
    
    // Sección 2: Ficha Técnica
    localidad: "",
    tipoAlojamiento: "",
    capacidadTotal: "",
    distribucionCamas: "",
    unidades: "",
    precio_desde: "",
    estadia_minima: "",
    
    // Sección 3: Logística
    direccion: "",
    googleMaps: "",
    distanciaTermas: "",
    tipoAcceso: "",
    
    // Sección 4: Perfiles y Servicios
    perfiles: [] as string[],
    servicios: [] as string[],
    mascotas: "",
    checkIn: "",
    checkOut: "",
    cancelacion: "",
    aceptaNinos: "",

    // Sección 5: Multimedia
    linkDrive: "",
    descripcion: "",
    
    // Sección 6: Acuerdo
    aceptoTerminos: false,
    aceptoResponsabilidad: false,
    clausulaVeracidad: false
  })

  const [userAccommodations, setUserAccommodations] = React.useState<any[]>([])

  const checkUserAccommodations = async (userId: string) => {
    const { data, error } = await supabase
      .from('alojamientos_pendientes')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error("Error fetching accommodations:", error)
      return []
    }
    return data
  }

  const progress = Math.max(17, (currentStep / steps.length) * 100)

  React.useEffect(() => {
    const checkSession = async () => {
      console.log("Verificando sesión inicial...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Error al obtener la sesión:", sessionError)
        setView("auth")
        return
      }

      if (session) {
        console.log("Sesión encontrada para:", session.user.id);
        setUserEmail(session.user.email ?? null)
        const accommodations = await checkUserAccommodations(session.user.id)
        console.log("Alojamientos encontrados en checkSession:", accommodations);
        setUserAccommodations(accommodations)
        if (accommodations.length > 0) {
          setView("dashboard")
        } else {
          setView("form")
        }
      } else {
        console.log("No se encontró sesión activa.")
        setView("auth")
      }
    }
    checkSession()
  }, [])

  React.useEffect(() => {
    if (editingAccommodation) {
      setFormData({
        propietario: editingAccommodation.propietario || "",
        whatsapp: editingAccommodation.whatsapp || "",
        email: editingAccommodation.email || "",
        nombreComplejo: editingAccommodation.nombre_complejo || "",
        localidad: editingAccommodation.localidad || "",
        tipoAlojamiento: editingAccommodation.tipo_alojamiento || "",
        capacidadTotal: editingAccommodation.capacidad_total || "",
        distribucionCamas: editingAccommodation.distribucion_camas || "",
        unidades: editingAccommodation.unidades || "",
        precio_desde: editingAccommodation.precio_desde || "",
        estadia_minima: editingAccommodation.estadia_minima || "",
        direccion: editingAccommodation.direccion || "",
        googleMaps: editingAccommodation.google_maps || "",
        distanciaTermas: editingAccommodation.distancia_termas || "",
        tipoAcceso: editingAccommodation.tipo_acceso || "",
        perfiles: editingAccommodation.perfiles || [],
        servicios: Array.from(
          new Set(
            (editingAccommodation.servicios || [])
              .filter((s: string) => !/^(tipo|capacidad)\s*:/i.test(s))
              .map((s: string) => {
                if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
                if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
                if (s === "Cochera cubierta") return "Cochera"
                if (s === "Pileta propia") return "Pileta"
                return s
              })
          )
        ),
        mascotas: editingAccommodation.mascotas || "",
        checkIn: editingAccommodation.check_in || "",
        checkOut: editingAccommodation.check_out || "",
        cancelacion: editingAccommodation.cancelacion || "",
        aceptaNinos: editingAccommodation.acepta_ninos || "",
        linkDrive: editingAccommodation.link_drive || "",
        descripcion: editingAccommodation.descripcion || "",
        aceptoTerminos: editingAccommodation.acepto_terminos || false,
        aceptoResponsabilidad: editingAccommodation.acepto_responsabilidad || false,
        clausulaVeracidad: editingAccommodation.clausula_veracidad || false,
      })
    }
  }, [editingAccommodation])

  const handleNext = () => {
    if (currentStep === 6) {
      handleSubmitForm()
      return
    }
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleItem = (category: 'perfiles' | 'servicios', item: string) => {
    if (category === "servicios") {
      const normalizedItem =
        item === "Asador" || item === "Parrilla" || item === "Quincho" || item === "Parrillero / Quincho"
          ? "Parrilla / Quincho"
          : item === "Ropa Blanca"
            ? "Ropa de Cama y Toallas"
            : item

      setFormData((prev) => {
        const normalizedCurrent = Array.from(
          new Set(
            prev.servicios
              .filter((s: string) => !/^(tipo|capacidad)\s*:/i.test(s))
              .map((s: string) => {
              if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
              if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
                if (s === "Cochera cubierta") return "Cochera"
                if (s === "Pileta propia") return "Pileta"
              return s
            })
          )
        )

        return {
          ...prev,
          servicios: normalizedCurrent.includes(normalizedItem)
            ? normalizedCurrent.filter((i) => i !== normalizedItem)
            : [...normalizedCurrent, normalizedItem],
        }
      })

      return
    }

    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }))
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    console.log("Intentando autenticación...", { authMode, email });

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        console.log("Resultado signUp:", { data, error });
        if (error) throw error
        alert("¡Cuenta creada! Revisa tu email para confirmar el registro.")
        setAuthMode("login")
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log("Resultado signIn:", { data, error });
        if (error) throw error
        
        setUserEmail(data.user.email ?? null)
        // Wait a small moment to ensure auth is synced
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const accommodations = await checkUserAccommodations(data.user.id)
        console.log("Alojamientos encontrados post-login:", accommodations.length);
        setUserAccommodations(accommodations)

        if (accommodations.length > 0) {
          setView("dashboard")
        } else {
          setView("form")
        }
      }
    } catch (err: any) {
      console.error("Error en handleAuth:", err);
      setError(err.message || "Ocurrió un error en la autenticación")
    } finally {
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUserEmail(null)
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
    setView("auth")
    setAuthMode("login")
  }

  const handleSubmitForm = async () => {
    setLoading(true)
    setError(null)
    console.log("Iniciando envío de formulario...", formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error("No hay sesión activa")

      const normalizedServicios = Array.from(
        new Set(
          formData.servicios
            .filter((s: string) => !/^(tipo|capacidad)\s*:/i.test(s))
            .map((s: string) => {
              if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho"
              if (s === "Ropa Blanca") return "Ropa de Cama y Toallas"
              if (s === "Cochera cubierta") return "Cochera"
              if (s === "Pileta propia") return "Pileta"
              return s
            })
        )
      )

      if (formData.mascotas === "Sí") {
        normalizedServicios.push("Pet Friendly")
      }

      const submissionData = {
        user_id: user.id,
        propietario: formData.propietario,
        whatsapp: formData.whatsapp,
        email: formData.email,
        nombre_complejo: formData.nombreComplejo,
        localidad: formData.localidad,
        tipo_alojamiento: formData.tipoAlojamiento,
        capacidad_total: formData.capacidadTotal,
        distribucion_camas: formData.distribucionCamas,
        unidades: formData.unidades,
        precio_desde: formData.precio_desde,
        estadia_minima: formData.estadia_minima,
        direccion: formData.direccion,
        google_maps: formData.googleMaps,
        distancia_termas: formData.distanciaTermas,
        tipo_acceso: formData.tipoAcceso,
        perfiles: formData.perfiles,
        servicios: Array.from(new Set(normalizedServicios)),
        mascotas: formData.mascotas,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        cancelacion: formData.cancelacion,
        acepta_ninos: formData.aceptaNinos,
        link_drive: formData.linkDrive,
        descripcion: formData.descripcion,
        acepto_terminos: formData.aceptoTerminos,
        acepto_responsabilidad: formData.aceptoResponsabilidad,
        clausula_veracidad: formData.clausulaVeracidad
      }

      let error
      if (editingAccommodation) {
        // Update existing accommodation
        const { error: updateError } = await supabase
          .from('alojamientos_pendientes')
          .update(submissionData)
          .eq('id', editingAccommodation.id)
        error = updateError
      } else {
        // Insert new accommodation
        const { error: insertError } = await supabase
          .from('alojamientos_pendientes')
          .insert([submissionData])
        error = insertError
      }

      if (error) throw error
      
      // Notificar al administrador
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            record: submissionData,
            type: editingAccommodation ? 'UPDATE' : 'INSERT'
          }),
        });
      } catch (notifyErr) {
        console.error("Error al enviar notificación:", notifyErr);
      }

      // Refresh user accommodations after update/insert
      if (user) {
        const accommodations = await checkUserAccommodations(user.id)
        setUserAccommodations(accommodations)
      }

      setView("success")
      setEditingAccommodation(null) // Reset editing state
    } catch (err: any) {
      console.error("Error en handleSubmitForm:", err);
      setError(err.message || "Error al enviar el formulario")
      alert("Error al enviar: " + (err.message || "Intente nuevamente"))
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (view === "success") {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg mx-auto"
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30">
                <Check className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-3xl font-black text-white">¡Formulario Enviado!</CardTitle>
              <CardDescription className="text-lg mt-2 text-white/70">
                Gracias por completar la información de <strong className="text-white">{formData.nombreComplejo}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-white/60 leading-relaxed">
                Sergio revisará los datos y el material multimedia a la brevedad. 
                Te contactaremos por WhatsApp o Email si necesitamos algo más.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={() => handleSignOut()}
                  className="w-full h-14 text-lg font-black bg-white text-primary hover:bg-white/90 rounded-full shadow-xl"
                >
                  Finalizar y Salir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    if (view === "dashboard") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="text-center pt-6 pb-2">
              <div className="flex justify-center mb-2">
                <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-white tracking-tight">Bienvenido de nuevo</CardTitle>
              {userEmail && (
                <div className="mt-1.5 flex items-center justify-center">
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/50 px-3 py-1 rounded-full text-[10px] font-bold lowercase tracking-wide">
                    {userEmail}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  Tus Alojamientos:
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {userAccommodations.map((acc) => (
                    <div key={acc.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all gap-4">
                      <div className="min-w-0">
                        <span className="font-bold text-white text-base tracking-tight truncate block">{acc.nombre_complejo}</span>
                        <p className="text-[11px] text-white/40 font-medium mt-0.5 truncate">{acc.localidad} • {acc.tipo_alojamiento}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-shrink-0 border-white/20 text-white hover:bg-white/10 font-bold rounded-full h-9 px-4 text-xs text-slate-900"
                        onClick={() => {
                          if (confirm(`¿Estás seguro que deseas modificar los datos de ${acc.nombre_complejo}?`)) {
                            setEditingAccommodation(acc)
                            setCurrentStep(1)
                            setView("form")
                          }
                        }}
                      >
                        Modificar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-4">
                <Button 
                  onClick={() => {
                    if (confirm("¿Deseas registrar un nuevo alojamiento?")) {
                      setEditingAccommodation(null)
                      setCurrentStep(1)
                      setFormData({
                        propietario: "",
                        whatsapp: "",
                        email: "",
                        nombreComplejo: "",
                        localidad: "",
                        tipoAlojamiento: "",
                        capacidadTotal: "",
                        distribucionCamas: "",
                        unidades: "",
                        precio_desde: "",
                        estadia_minima: "",
                        direccion: "",
                        googleMaps: "",
                        distanciaTermas: "",
                        tipoAcceso: "",
                        perfiles: [],
                        servicios: [],
                        mascotas: "",
                        checkIn: "",
                        checkOut: "",
                        cancelacion: "",
                        aceptaNinos: "",
                        linkDrive: "",
                        descripcion: "",
                        aceptoTerminos: false,
                        aceptoResponsabilidad: false,
                        clausulaVeracidad: false,
                      })
                      setView("form")
                    }
                  }} 
                  className="w-full h-14 text-lg font-black bg-white text-slate-900 hover:bg-white/90 shadow-xl rounded-2xl border-none transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <div className="bg-primary p-1.5 rounded-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  Registrar Nuevo Alojamiento
                </Button>
                <div className="text-center">
                  <button 
                    onClick={handleSignOut}
                    className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors py-2"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    if (view === "auth") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="text-center mb-6 space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-2xl">Portal de Socios</h1>
            <p className="text-white/70 text-base font-light">Gestiona la información de tu alojamiento</p>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-4 pt-8">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 shadow-inner">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black text-center text-white tracking-tight">
                {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </CardTitle>
              <CardDescription className="text-center text-white/60 text-sm font-medium">
                {authMode === "login" 
                  ? "Ingresa tus credenciales para continuar" 
                  : "Regístrate para dar de alta tu alojamiento"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/80 font-bold ml-1 text-xs">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                    <Input id="email" type="email" placeholder="nombre@ejemplo.com" className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:ring-primary focus:border-primary transition-all text-sm" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-white/80 font-bold ml-1 text-xs">Contraseña</Label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:ring-primary focus:border-primary transition-all text-sm" required />
                  </div>
                </div>
                {authMode === "login" && (
                  <div className="text-right">
                    <button type="button" className="text-[10px] font-bold text-white/40 hover:text-white transition-colors">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
                <Button type="submit" className="w-full h-12 text-base font-black bg-primary hover:bg-primary/90 text-white shadow-2xl rounded-xl mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                  {loading ? "Procesando..." : (authMode === "login" ? "Entrar al Portal" : "Registrarse como Socio")}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                  <span className="bg-[#1a1f2c]/50 backdrop-blur-xl px-4 text-white/30">O también</span>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-sm text-white/60 hover:text-white transition-all font-bold"
                >
                  {authMode === "login" 
                    ? "¿No tienes cuenta? Regístrate gratis" 
                    : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
              </div>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-[10px] text-white/30 leading-relaxed font-medium px-8">
            Al continuar, aceptas formar parte de la red de Viví las Termas y cumplir con los estándares de calidad establecidos.
          </p>
        </motion.div>
      )
    }

    // Default: return the form view
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header & Progress */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-2 bg-black/20 backdrop-blur-md p-2 rounded-full px-4 border border-white/10">
            <button 
              onClick={handleSignOut}
              className="text-xs font-bold text-white/80 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Cerrar Sesión
            </button>
            {userAccommodations.length > 0 && (
              <button 
                onClick={() => setView("dashboard")}
                className="text-xs font-bold text-white/80 hover:underline flex items-center gap-1 transition-colors"
              >
                Ir a mi Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <div className="flex items-center gap-2">
              {userEmail && (
                <span className="text-[10px] font-medium text-white/40 lowercase tracking-wide mr-2 border-r border-white/10 pr-3">
                  {userEmail}
                </span>
              )}
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Sesión Activa</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">Portal para Socios</h1>
          <p className="text-white/70 text-lg font-light">Gestiona tus alojamientos verificados</p>
          
          {userAccommodations.length > 0 && !editingAccommodation && (
            <div className="max-w-2xl mx-auto mt-6 p-5 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-2xl flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-primary/30 p-2 rounded-full">
                  <Info className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">Tienes {userAccommodations.length} alojamiento(s) registrado(s).</span>
              </div>
              <Button size="sm" onClick={() => setView("dashboard")} className="bg-white text-primary hover:bg-white/90 font-black rounded-full px-6">
                Ir a mi Dashboard
              </Button>
            </div>
          )}
          
          <div className="pt-8 max-w-2xl mx-auto">
            <div className="flex justify-between mb-3">
              <span className="text-xs font-black text-white/90 uppercase tracking-[0.2em]">
                Paso {currentStep} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10 border border-white/5" />
          </div>
        </div>

        {/* Stepper (Desktop) */}
        <div className="hidden md:flex justify-between mb-12">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                  isActive ? "bg-primary text-white border-primary shadow-lg scale-110" : 
                  isCompleted ? "bg-green-500 text-white border-green-500" : "bg-white/10 text-white/50 border-white/20"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-tighter",
                  isActive ? "text-primary" : "text-white/50"
                )}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: -20, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-white/10 bg-white/5 shadow-xl overflow-hidden backdrop-blur-lg">
              <CardContent className="p-6 md:p-10">
                
                {/* Step 1: Identidad */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-white">Sección 1: Datos de Identidad</h2>
                      <p className="text-sm text-white/60 mt-1 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Estos datos son para uso interno de administración.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/80">Nombre del Complejo / Alojamiento</Label>
                        <Input 
                          placeholder="Ej: Cabañas El Paraíso" 
                          value={formData.nombreComplejo}
                          onChange={(e) => setFormData({...formData, nombreComplejo: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Nombre del Propietario / Administrador</Label>
                        <Input 
                          placeholder="Nombre completo" 
                          value={formData.propietario}
                          onChange={(e) => setFormData({...formData, propietario: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">WhatsApp de contacto directo</Label>
                        <Input 
                          placeholder="+54 9 351 ..." 
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Email</Label>
                        <Input 
                          type="email" 
                          placeholder="ejemplo@correo.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Ficha Técnica */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-white">Sección 2: Ficha Técnica</h2>
                      <p className="text-sm text-white/60 mt-1">Estos datos irán directo a la ficha web pública.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/80">Localidad</Label>
                        <select 
                          className="w-full h-12 px-3 rounded-xl border border-white/20 bg-white/5 text-white outline-none focus:ring-2 focus:ring-primary"
                          value={formData.localidad}
                          onChange={(e) => setFormData({...formData, localidad: e.target.value})}
                        >
                          <option value="" className="bg-slate-900">Seleccione una opción</option>
                          <option value="El Durazno" className="bg-slate-900">El Durazno</option>
                          <option value="Villa Yacanto" className="bg-slate-900">Villa Yacanto</option>
                          <option value="Termas" className="bg-slate-900">Termas (Zona Aledaña)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Tipo de Alojamiento</Label>
                        <select 
                          className="w-full h-12 px-3 rounded-xl border border-white/20 bg-white/5 text-white outline-none focus:ring-2 focus:ring-primary"
                          value={formData.tipoAlojamiento}
                          onChange={(e) => setFormData({...formData, tipoAlojamiento: e.target.value})}
                        >
                          <option value="" className="bg-slate-900">Seleccione tipo</option>
                          <option value="Cabaña" className="bg-slate-900">Cabaña</option>
                          <option value="Hostería" className="bg-slate-900">Hostería</option>
                          <option value="Apart-Hotel" className="bg-slate-900">Apart-Hotel</option>
                          <option value="Departamento" className="bg-slate-900">Departamento</option>
                          <option value="Casa de Campo" className="bg-slate-900">Casa de Campo</option>
                          <option value="Complejo Turístico" className="bg-slate-900">Complejo Turístico</option>
                          <option value="Domo/Glamping" className="bg-slate-900">Domo/Glamping</option>
                          <option value="Camping" className="bg-slate-900">Camping</option>
                          <option value="Estancia Rural" className="bg-slate-900">Estancia Rural</option>
                          <option value="Refugio de Montaña" className="bg-slate-900">Refugio de Montaña</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Capacidad Total de Personas</Label>
                        <Input 
                          type="number" 
                          placeholder="Cantidad total de huéspedes" 
                          value={formData.capacidadTotal}
                          onChange={(e) => setFormData({...formData, capacidadTotal: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Cantidad de Unidades</Label>
                        <Input 
                          type="number" 
                          placeholder="Ej: 3 cabañas" 
                          value={formData.unidades}
                          onChange={(e) => setFormData({...formData, unidades: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Precio desde ($)</Label>
                        <Input 
                          type="number" 
                          placeholder="Precio base por noche" 
                          value={formData.precio_desde}
                          onChange={(e) => setFormData({...formData, precio_desde: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Estadía mínima (noches)</Label>
                        <Input 
                          type="number" 
                          placeholder="Mínimo de noches" 
                          value={formData.estadia_minima}
                          onChange={(e) => setFormData({...formData, estadia_minima: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Distribución de Camas</Label>
                      <Textarea 
                        placeholder="Ej: 1 matrimonial, 2 individuales, sofá cama..." 
                        className="h-24 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                        value={formData.distribucionCamas}
                        onChange={(e) => setFormData({...formData, distribucionCamas: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Logística */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-white">Sección 3: Geolocalización y Entorno</h2>
                      <p className="text-sm text-white/60 mt-1">Vital para coordinar el traslado a las Termas del Sol.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/80">Dirección y Número</Label>
                        <Input 
                          placeholder="Calle, Barrio, Paraje..." 
                          value={formData.direccion}
                          onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Link de Google Maps / Coordenadas</Label>
                        <Input 
                          placeholder="Pega la URL del mapa" 
                          value={formData.googleMaps}
                          onChange={(e) => setFormData({...formData, googleMaps: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Distancia a las Termas del Sol</Label>
                        <Input 
                          placeholder="Ej: 500 metros o 10 min en auto" 
                          value={formData.distanciaTermas}
                          onChange={(e) => setFormData({...formData, distanciaTermas: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Tipo de Acceso</Label>
                        <select 
                          className="w-full h-12 px-3 rounded-xl border border-white/20 bg-white/5 text-white outline-none focus:ring-2 focus:ring-primary"
                          value={formData.tipoAcceso}
                          onChange={(e) => setFormData({...formData, tipoAcceso: e.target.value})}
                        >
                          <option value="" className="bg-slate-900">Seleccione dificultad</option>
                          <option value="Asfalto" className="bg-slate-900">Asfalto</option>
                          <option value="Ripio" className="bg-slate-900">Ripio consolidado</option>
                          <option value="Huella 4x4" className="bg-slate-900">Requiere 4x4 / Huella</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Perfiles y Servicios */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="border-b border-white/10 pb-4 mb-2">
                      <h2 className="text-2xl font-bold text-white">Sección 4: Perfiles y Servicios</h2>
                      <p className="text-sm text-white/60 mt-1">Permite filtrar según el tipo de cliente ideal.</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base text-white/80 font-bold">Ideal para:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {["Parejas", "Familias con hijos", "Grupos de amigos", "Senior", "Corporativos"].map(perfil => (
                          <div key={perfil} className="flex items-center space-x-2 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer" onClick={() => toggleItem('perfiles', perfil)}>
                            <Checkbox checked={formData.perfiles.includes(perfil)} className="border-white/30" />
                            <span className="text-sm text-white/90 font-medium">{perfil}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base text-white/80 font-bold">Servicios Incluidos:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { value: "Pileta", label: "Pileta" },
                          { value: "Wi-Fi", label: "Wi-Fi" },
                          { value: "Cochera", label: "Cochera" },
                          { value: "Parrilla / Quincho", label: "Parrilla / Quincho" },
                          { value: "Desayuno", label: "Desayuno" },
                          { value: "Aire Acondicionado", label: "Aire Acondicionado" },
                          { value: "Estufa a leña", label: "Calefacción" },
                          { value: "Ropa de Cama y Toallas", label: "Ropa de Cama y Toallas" },
                        ].map(({ value, label }) => (
                          <div key={value} className="flex items-center space-x-2 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer" onClick={() => toggleItem('servicios', value)}>
                            <Checkbox checked={formData.servicios.includes(value)} className="border-white/30" />
                            <span className="text-sm text-white/90 font-medium">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-2">
                        <Label className="text-base text-white/80 font-bold">¿Acepta Mascotas?</Label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-primary bg-white/5 border-white/20"
                            checked={formData.mascotas === "Sí"}
                            onChange={(e) => setFormData({ ...formData, mascotas: e.target.checked ? "Sí" : "No" })}
                          />
                          <span className="text-base text-white/80 group-hover:text-white transition-colors">
                            Pet Friendly
                          </span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base text-white/80 font-bold">¿Acepta niños pequeños?</Label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-primary bg-white/5 border-white/20"
                            checked={formData.aceptaNinos === "Sí"}
                            onChange={(e) => setFormData({ ...formData, aceptaNinos: e.target.checked ? "Sí" : "No" })}
                          />
                          <span className="text-base text-white/80 group-hover:text-white transition-colors">
                            Acepta niños
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                      <div className="space-y-2">
                        <Label className="text-white/80">Políticas de Check-in / Out</Label>
                        <Input 
                          placeholder="Ej: IN 14:00 - OUT 10:00" 
                          value={formData.checkIn}
                          onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/80">Política de Cancelación</Label>
                        <Input 
                          placeholder="Ej: Reembolso 48hs antes" 
                          value={formData.cancelacion}
                          onChange={(e) => setFormData({...formData, cancelacion: e.target.value})}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Multimedia */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-bold text-white">Sección 5: Material Multimedia</h2>
                      <p className="text-sm text-white/60 mt-1">El "motor" visual de tu publicación.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl flex items-start gap-5 shadow-inner">
                        <div className="bg-primary/20 p-3 rounded-2xl">
                          <ImageIcon className="w-8 h-8 text-white flex-shrink-0" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-white text-xl font-black tracking-tight">Link a Material de Alta Calidad</Label>
                          <p className="text-sm text-white/60 leading-relaxed">
                            Para garantizar la mejor calidad, pegue aquí el link de su carpeta de <strong>Google Drive, Dropbox o WeTransfer</strong>. 
                            Recomendamos: 5 fotos exterior, 5 interior y 1 video/drone.
                          </p>
                          <Input 
                            placeholder="https://drive.google.com/..." 
                            className="bg-white/10 border-white/10 text-white placeholder:text-white/20 h-14 rounded-2xl"
                            value={formData.linkDrive}
                            onChange={(e) => setFormData({...formData, linkDrive: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-lg text-white/80 font-bold ml-1">Descripción para el Turista</Label>
                        <p className="text-sm text-white/40 mb-3 italic ml-1">Contanos qué hace única a tu cabaña (la vista, la paz, la decoración).</p>
                        <Textarea 
                          placeholder="Escribe aquí el relato que verán los huéspedes..." 
                          className="h-48 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-2xl p-6 leading-relaxed"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Acuerdo */}
                {currentStep === 6 && (
                  <div className="space-y-8">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="text-2xl font-bold text-white">Sección 6: Acuerdo de Colaboración</h2>
                      <p className="text-sm text-white/60 mt-1">Aviso Legal y Deslinde de Responsabilidad.</p>
                    </div>

                    <div className="bg-black/40 p-8 rounded-3xl text-sm text-white/60 space-y-6 leading-relaxed max-h-[450px] overflow-y-auto border border-white/5 shadow-inner custom-scrollbar">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">1. Naturaleza del Servicio</h4>
                          <p>Viví las Termas / Termas del Sol actúa exclusivamente como una plataforma de difusión y verificación de calidad. El sitio facilita el contacto entre el huésped y el alojamiento, pero no interviene en la contratación ni en la prestación del servicio de hospedaje.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">2. Responsabilidad del Propietario</h4>
                          <p>Todo evento, siniestro, discrepancia en los servicios ofrecidos o inconveniente ocurrido dentro de las instalaciones del alojamiento es responsabilidad exclusiva de sus propietarios y/o administradores.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">3. Resolución de Conflictos</h4>
                          <p>Ante cualquier discrepancia sobre la estadía (limpieza, tarifas, disponibilidad, servicios adicionales), el usuario acepta que debe resolverlo directamente con la administración del alojamiento seleccionado. Termas del Sol no actúa como mediador ni responsable solidario.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">4. Alojamiento Verificado</h4>
                          <p>El sello de "Alojamiento Verificado" indica que el establecimiento cumple con estándares básicos de calidad y legalidad constatados al momento de su alta, pero no garantiza el comportamiento futuro del prestador.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">5. Paridad de Tarifas y Actualización</h4>
                          <p>El Propietario se compromete a mantener en <strong className="text-white">vivilastermas.com.ar</strong> una tarifa igual o inferior a la ofrecida en sus canales de venta directa o plataformas de terceros (Paridad de Tarifas).</p>
                          <p><strong className="text-white">Actualizaciones:</strong> Cualquier modificación en las tarifas publicadas deberá ser comunicada a la administración de la web con una antelación mínima de 72 horas hábiles.</p>
                          <p><strong className="text-white">Garantía al Usuario:</strong> Ante cualquier discrepancia, el Propietario se obliga a respetar el precio estipulado y vigente en el portal al momento de la consulta o reserva del huésped.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-black text-white uppercase tracking-widest text-xs">6. Comisión por Gestión de Reserva</h4>
                          <p>El Propietario acepta abonar a <strong className="text-white">vivilastermas.com.ar</strong> una comisión del <strong className="text-white text-lg">10% (diez por ciento)</strong> sobre el valor total de cada reserva efectiva que haya sido derivada o gestionada a través del portal.</p>
                          <p>El incumplimiento en el reporte o pago de dichas comisiones será causal de baja inmediata del listado de prestadores verificados.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-start space-x-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setFormData({...formData, aceptoTerminos: !formData.aceptoTerminos})}>
                        <Checkbox 
                          id="terms1" 
                          checked={formData.aceptoTerminos}
                          className="border-white/30 mt-1"
                        />
                        <Label htmlFor="terms1" className="text-sm leading-relaxed cursor-pointer text-white/80">
                          Entiendo que esta información será utilizada por el sitio web <strong className="text-white">vivilastermas.com.ar</strong> para asesoramiento turístico y derivación de ventas.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setFormData({...formData, aceptoResponsabilidad: !formData.aceptoResponsabilidad})}>
                        <Checkbox 
                          id="terms2" 
                          checked={formData.aceptoResponsabilidad}
                          className="border-white/30 mt-1"
                        />
                        <Label htmlFor="terms2" className="text-sm leading-relaxed cursor-pointer text-white/80">
                          Acepto que Viví las Termas y Termas del Sol actúan como canal de promoción y que la responsabilidad civil, legal y comercial por la estadía recae íntegramente sobre mi administración. Asimismo, ratifico mi compromiso con la paridad tarifaria y el esquema de comisiones del 10% por reserva efectiva derivado de la plataforma.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setFormData({...formData, clausulaVeracidad: !formData.clausulaVeracidad})}>
                        <Checkbox 
                          id="terms3" 
                          checked={formData.clausulaVeracidad}
                          className="border-white/30 mt-1"
                        />
                        <Label htmlFor="terms3" className="text-sm leading-relaxed cursor-pointer text-white/80">
                          Declaro que la información proporcionada es veraz. Entiendo que reclamos por información engañosa o incumplimiento de las condiciones comerciales resultarán en la baja inmediata del listado.
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-between mt-12 pt-10 border-t border-white/10">
                  <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    disabled={currentStep === 1}
                    className="gap-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl px-6 h-12 font-bold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button onClick={handleNext} className="gap-2 px-10 h-12 rounded-xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
                      Continuar <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      className="gap-2 px-10 h-12 rounded-xl font-black bg-green-500 hover:bg-green-600 shadow-2xl transition-all hover:scale-105 active:scale-95" 
                      disabled={loading || !formData.aceptoTerminos || !formData.aceptoResponsabilidad || !formData.clausulaVeracidad}
                      onClick={handleSubmitForm}
                    >
                      {loading ? "Enviando..." : "Finalizar Registro"} <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Support Section */}
        <div className="mt-16 text-center space-y-6">
          <p className="text-sm text-white/40 font-medium">¿Necesitas ayuda con el formulario?</p>
          <div className="flex justify-center gap-10">
            <a href="#" className="flex items-center gap-2 text-xs font-black text-white/60 hover:text-primary transition-all uppercase tracking-widest">
              <MessageCircle className="w-5 h-5" /> WhatsApp Soporte
            </a>
            <a href="#" className="flex items-center gap-2 text-xs font-black text-white/60 hover:text-primary transition-all uppercase tracking-widest">
              <Globe className="w-5 h-5" /> Web Principal
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/background-socios.jpg" 
          alt="Background" 
          className="h-full w-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px] bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen pt-24 pb-16 flex items-center justify-center">
        {renderContent()}
      </div>

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite alternate linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
