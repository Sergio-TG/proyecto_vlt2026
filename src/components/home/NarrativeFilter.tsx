"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTaxonomiaServicios } from "@/lib/supabase-queries"
import { 
  Heart, Users, Briefcase, User, Sun, 
  Leaf, Mountain, Compass, 
  Wifi, Coffee, Car, Flame, Waves, Fish, Accessibility, PawPrint,
  ArrowRight, Check, Baby, UsersRound, Utensils, Wind, Snowflake
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// --- Data Definitions ---

const travelerTypes = [
  { id: "couple", label: "Pareja", sub: "Escapada Romántica", icon: Heart },
  { id: "family_kids", label: "Familia con niños", sub: "Aventura Familiar", icon: UsersRound },
  { id: "friends", label: "Grupo de Amigos", sub: "Desconexión Grupal", icon: Users },
  { id: "corporate", label: "Corporativo", sub: "Team Building Natural", icon: Briefcase },
  { id: "solo", label: "Viajero", sub: "Reconexión Personal", icon: User },
  { id: "seniors", label: "Senior +60", sub: "Confort y Tranquilidad", icon: Sun },
]

const experienceTypes = [
  { 
    id: "relax", 
    label: "BIENESTAR Y RELAX", 
    desc: "Desconexión total, masajes y aguas termales para renovar energías",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-600"
  },
  { 
    id: "adventure", 
    label: "AVENTURA Y EXPLORACIÓN", 
    desc: "Senderismo, recorridos guiados y actividades al aire libre",
    icon: Compass,
    color: "bg-orange-100 text-orange-600"
  },
  { 
    id: "nature", 
    label: "ESCENARIOS NATURALES", 
    desc: "Vistas panorámicas, atardeceres únicos y aire puro de montaña",
    icon: Mountain,
    color: "bg-blue-100 text-blue-600"
  },
]

const amenities = [
  { id: "pet_friendly", label: "Pet Friendly", serviceName: "Pet Friendly", defaultIcon: PawPrint },
  { id: "wifi_high", label: "Wi-Fi", serviceName: "Wi-Fi", defaultIcon: Wifi },
  { id: "breakfast", label: "Desayuno", serviceName: "Desayuno", defaultIcon: Coffee },
  { id: "parking_covered", label: "Cochera", serviceName: "Cochera", defaultIcon: Car },
  { id: "linens", label: "Ropa de Cama y Toallas", serviceName: "Ropa de Cama y Toallas", defaultIcon: Sun },
  { id: "bbq", label: "Parrilla / Quincho", serviceName: "Parrilla / Quincho", defaultIcon: Utensils },
  { id: "heating", label: "Calefacción", serviceName: "Estufa a leña", defaultIcon: Flame },
  { id: "ac", label: "Aire Acondicionado", serviceName: "Aire Acondicionado", defaultIcon: Snowflake },
  { id: "pool", label: "Pileta", serviceName: "Pileta", defaultIcon: Waves },
  { id: "mountain_view", label: "Vista a la Montaña", serviceName: "Vista a la Montaña", defaultIcon: Mountain },
  { id: "river", label: "Cerca de Río/Arroyo", serviceName: "Cerca de Río/Arroyo", defaultIcon: Fish },
  { id: "accessibility", label: "Accesibilidad", serviceName: "Accesibilidad", defaultIcon: Accessibility },
]

const featuredAmenityIds = new Set(["parking_covered", "bbq", "breakfast"])

const ICON_BY_KEY: Record<string, React.ElementType> = {
  Car,
  Users,
  PawPrint,
  Dog: PawPrint,
  Flame,
  Utensils,
  Wind,
  Snowflake,
  Wifi,
  Coffee,
  Waves,
  Mountain,
  Fish,
  Accessibility,
  Sun,
}

export function NarrativeFilter() {
  const [taxonomyByName, setTaxonomyByName] = React.useState<Record<string, string>>({})
  const [step, setStep] = React.useState(1)
  const [selections, setSelections] = React.useState({
    travelers: [] as string[],
    experience: "" as string,
    amenities: [] as string[]
  })

  React.useEffect(() => {
    let mounted = true
    async function load() {
      const taxonomy = await getTaxonomiaServicios()
      if (!mounted) return
      const next: Record<string, string> = {}
      for (const item of taxonomy) {
        if (!item.nombre) continue
        next[item.nombre] = item.icono_key || ""
      }
      setTaxonomyByName(next)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const progress = (step / 3) * 100

  const handleTravelerToggle = (id: string) => {
    setSelections(prev => {
      const isSelected = prev.travelers.includes(id)
      return {
        ...prev,
        travelers: isSelected 
          ? prev.travelers.filter(t => t !== id)
          : [...prev.travelers, id]
      }
    })
  }

  const handleExperienceSelect = (id: string) => {
    setSelections(prev => ({ ...prev, experience: id }))
  }

  const handleAmenityToggle = (id: string) => {
    setSelections(prev => {
      const isSelected = prev.amenities.includes(id)
      return {
        ...prev,
        amenities: isSelected
          ? prev.amenities.filter(a => a !== id)
          : [...prev.amenities, id]
      }
    })
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3))
  // const prevStep = () => setStep(prev => Math.max(prev - 1, 1)) // If needed

  const selectedFeatureIds = React.useMemo(() => {
    const featureIds: string[] = []
    for (const id of selections.amenities) {
      if (id === "wifi_high") featureIds.push("wifi")
      if (id === "pet_friendly") featureIds.push("pet")
      if (id === "pool") featureIds.push("pool")
      if (id === "parking_covered") featureIds.push("parking")
      if (id === "bbq") featureIds.push("bbq")
      if (id === "breakfast") featureIds.push("breakfast")
      if (id === "heating") featureIds.push("heating")
    }
    return Array.from(new Set(featureIds))
  }, [selections.amenities])

  const recommendationsHref = React.useMemo(() => {
    const params = new URLSearchParams()
    if (selectedFeatureIds.length > 0) {
      params.set("features", selectedFeatureIds.join(","))
    }
    const qs = params.toString()
    return qs ? `/alojamientos?${qs}` : "/alojamientos"
  }, [selectedFeatureIds])

  return (
    <div className="w-full max-w-5xl mx-auto -mt-20 [@media(max-height:1100px)]:-mt-8 [@media(max-height:950px)]:mt-0 relative z-30 px-4">
      <Card className="shadow-xl border-none">
        <div className="p-6 md:p-8">
            <div className="space-y-4 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Contanos sobre tu viaje ideal
                        </h3>
                        <p className="text-muted-foreground">
                            Te recomendaremos lo mejor para vos
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>Paso {step} de 3</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h4 className="text-lg font-semibold">¿Quién viaja?</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {travelerTypes.map((type) => {
                                const isSelected = selections.travelers.includes(type.id)
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => handleTravelerToggle(type.id)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-200 hover:shadow-md",
                                            isSelected 
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                                : "border-transparent bg-secondary/50 hover:bg-secondary"
                                        )}
                                    >
                                        <type.icon className={cn(
                                            "w-8 h-8",
                                            isSelected ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <div className="space-y-1">
                                            <p className={cn("font-medium text-sm", isSelected && "text-primary")}>
                                                {type.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                {type.sub}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h4 className="text-lg font-semibold">¿Qué tipo de experiencia buscas?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {experienceTypes.map((type) => {
                                const isSelected = selections.experience === type.id
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => handleExperienceSelect(type.id)}
                                        className={cn(
                                            "cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                                            isSelected ? "border-primary ring-4 ring-primary/10" : "border-transparent hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn("h-40 flex items-center justify-center", type.color)}>
                                            <type.icon className="w-16 h-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-6 bg-card">
                                            <h5 className="font-bold text-lg mb-2">{type.label}</h5>
                                            <p className="text-muted-foreground text-sm">{type.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h4 className="text-lg font-semibold">Preferencias y Servicios</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[...amenities].sort((a, b) => {
                              const aFeatured = featuredAmenityIds.has(a.id)
                              const bFeatured = featuredAmenityIds.has(b.id)
                              if (aFeatured === bFeatured) return 0
                              return aFeatured ? -1 : 1
                            }).map((item) => {
                              const iconKey = taxonomyByName[item.serviceName]
                              const Icon = (iconKey && ICON_BY_KEY[iconKey]) ? ICON_BY_KEY[iconKey] : item.defaultIcon

                              return (
                                <div
                                  key={item.id}
                                  className={cn(
                                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                                    featuredAmenityIds.has(item.id)
                                      ? "bg-primary/5 hover:bg-primary/10 border border-primary/20"
                                      : "hover:bg-secondary/50"
                                  )}
                                >
                                  <Checkbox 
                                    id={item.id} 
                                    checked={selections.amenities.includes(item.id)}
                                    onCheckedChange={() => handleAmenityToggle(item.id)}
                                  />
                                  <Label 
                                    htmlFor={item.id} 
                                    className="flex items-center gap-2 cursor-pointer font-normal"
                                  >
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    {item.label}
                                  </Label>
                                </div>
                              )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
                {step < 3 ? (
                    <Button 
                        onClick={nextStep} 
                        size="lg"
                        className="px-8"
                        disabled={
                            (step === 1 && selections.travelers.length === 0) ||
                            (step === 2 && !selections.experience)
                        }
                    >
                        Siguiente <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                ) : (
                    <Link href={recommendationsHref}>
                        <Button 
                            size="lg"
                            className="px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                        >
                            Ver Recomendaciones Personalizadas
                        </Button>
                    </Link>
                )}
            </div>
        </div>
      </Card>
    </div>
  )
}
