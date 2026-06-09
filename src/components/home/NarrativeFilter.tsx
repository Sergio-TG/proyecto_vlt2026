"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getTaxonomiaServicios } from "@/lib/supabase-queries"
import {
  Heart,
  Users,
  Briefcase,
  User,
  Sun,
  Leaf,
  Mountain,
  Compass,
  Wifi,
  Coffee,
  Car,
  Flame,
  Waves,
  Fish,
  Accessibility,
  PawPrint,
  ArrowRight,
  Check,
  UsersRound,
  Utensils,
  Wind,
  Snowflake,
} from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const TRAVELER_META = [
  { id: "couple" as const, icon: Heart },
  { id: "family_kids" as const, icon: UsersRound },
  { id: "friends" as const, icon: Users },
  { id: "corporate" as const, icon: Briefcase },
  { id: "solo" as const, icon: User },
  { id: "seniors" as const, icon: Sun },
]

const EXPERIENCE_META = [
  {
    id: "relax" as const,
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "adventure" as const,
    icon: Compass,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "nature" as const,
    icon: Mountain,
    color: "bg-blue-100 text-blue-600",
  },
]

const AMENITY_META = [
  { id: "pet_friendly" as const, serviceName: "Pet Friendly", defaultIcon: PawPrint },
  { id: "wifi_high" as const, serviceName: "Wi-Fi", defaultIcon: Wifi },
  { id: "breakfast" as const, serviceName: "Desayuno", defaultIcon: Coffee },
  { id: "parking_covered" as const, serviceName: "Cochera", defaultIcon: Car },
  { id: "linens" as const, serviceName: "Ropa de Cama y Toallas", defaultIcon: Sun },
  { id: "bbq" as const, serviceName: "Parrilla / Quincho", defaultIcon: Utensils },
  { id: "heating" as const, serviceName: "Calefacción", defaultIcon: Flame },
  { id: "ac" as const, serviceName: "Aire Acondicionado", defaultIcon: Snowflake },
  { id: "pool" as const, serviceName: "Pileta", defaultIcon: Waves },
  { id: "mountain_view" as const, serviceName: "Vista a la Montaña", defaultIcon: Mountain },
  { id: "river" as const, serviceName: "Cerca de Río/Arroyo", defaultIcon: Fish },
  { id: "accessibility" as const, serviceName: "Accesibilidad", defaultIcon: Accessibility },
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
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)

  const travelerTypes = React.useMemo(
    () =>
      TRAVELER_META.map((row) => ({
        ...row,
        label: copy.narrative.travelers[row.id].label,
        sub: copy.narrative.travelers[row.id].sub,
      })),
    [copy]
  )

  const experienceTypes = React.useMemo(
    () =>
      EXPERIENCE_META.map((row) => ({
        ...row,
        label: copy.narrative.experiences[row.id].label,
        desc: copy.narrative.experiences[row.id].desc,
      })),
    [copy]
  )

  const amenities = React.useMemo(
    () =>
      AMENITY_META.map((row) => ({
        ...row,
        label: copy.narrative.amenities[row.id],
      })),
    [copy]
  )

  const [taxonomyByName, setTaxonomyByName] = React.useState<Record<string, string>>({})
  const [step, setStep] = React.useState(1)
  const [selections, setSelections] = React.useState({
    travelers: [] as string[],
    experience: "" as string,
    amenities: [] as string[],
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

  const isTravelerDisabled = React.useCallback((id: string, selected: string[]) => {
    const hasFamily = selected.includes("family_kids")
    const hasSolo = selected.includes("solo")
    if (hasFamily) return id !== "family_kids"
    if (hasSolo) return id !== "solo"

    const hasCouple = selected.includes("couple")
    const hasFriends = selected.includes("friends")

    if (id === "family_kids" || id === "solo") {
      return selected.length > 0
    }

    if (id === "couple") {
      return hasFriends
    }

    if (id === "friends") {
      return hasCouple
    }

    if (id === "corporate" || id === "seniors") {
      return false
    }

    return false
  }, [])

  const handleTravelerToggle = (id: string) => {
    setSelections((prev) => {
      if (isTravelerDisabled(id, prev.travelers)) return prev

      const isSelected = prev.travelers.includes(id)

      if (!isSelected && (id === "family_kids" || id === "solo")) {
        return {
          ...prev,
          travelers: [id],
        }
      }

      if (isSelected) {
        return {
          ...prev,
          travelers: prev.travelers.filter((t) => t !== id),
        }
      }

      if (id === "couple") {
        const cleaned = prev.travelers.filter((t) => t !== "family_kids" && t !== "friends" && t !== "solo")
        return {
          ...prev,
          travelers: Array.from(new Set([...cleaned, "couple"])),
        }
      }

      if (id === "friends") {
        const cleaned = prev.travelers.filter((t) => t !== "family_kids" && t !== "couple" && t !== "solo")
        return {
          ...prev,
          travelers: Array.from(new Set([...cleaned, "friends"])),
        }
      }

      return {
        ...prev,
        travelers: [...prev.travelers, id],
      }
    })
  }

  const handleExperienceSelect = (id: string) => {
    setSelections((prev) => ({ ...prev, experience: id }))
  }

  const handleAmenityToggle = (id: string) => {
    setSelections((prev) => {
      const isSelected = prev.amenities.includes(id)
      return {
        ...prev,
        amenities: isSelected ? prev.amenities.filter((a) => a !== id) : [...prev.amenities, id],
      }
    })
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

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

  const selectedServiceKeys = React.useMemo(() => {
    const map: Record<string, string> = {
      breakfast: "desayuno",
      parking_covered: "cochera",
      bbq: "parrilla-quincho",
      pet_friendly: "pet-friendly",
      wifi_high: "wi-fi",
      linens: "ropa-de-cama-y-toallas",
      heating: "calefaccion",
      ac: "aire-acondicionado",
      pool: "pileta",
      mountain_view: "vista-a-la-montana",
      river: "cerca-de-rio-arroyo",
      accessibility: "accesibilidad",
    }
    return Array.from(new Set(selections.amenities.map((id) => map[id]).filter((v): v is string => Boolean(v))))
  }, [selections.amenities])

  const experienceKey = React.useMemo(() => {
    const map: Record<string, string> = {
      relax: "bienestar-y-relax",
      adventure: "aventura-y-exploracion",
      nature: "escenarios-naturales",
    }
    return selections.experience ? map[selections.experience] ?? selections.experience : ""
  }, [selections.experience])

  const recommendationsHref = React.useMemo(() => {
    const params = new URLSearchParams()
    if (selectedFeatureIds.length > 0) {
      params.set("features", selectedFeatureIds.join(","))
    }
    if (selectedServiceKeys.length > 0) {
      params.set("servicios", selectedServiceKeys.join(","))
    }
    if (experienceKey) {
      params.set("experience", experienceKey)
    }
    const qs = params.toString()
    return qs ? `/alojamientos?${qs}` : "/alojamientos"
  }, [selectedFeatureIds, selectedServiceKeys, experienceKey])

  return (
    <div className="w-full flex items-center justify-center relative z-30 px-4 mt-16 md:mt-20 [@media(max-height:1100px)]:mt-12 [@media(max-height:950px)]:mt-8">
      <Card className="w-full max-w-5xl shadow-xl border-none bg-white/90 backdrop-blur-sm rounded-3xl">
        <div className="p-6 md:p-8">
          <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{copy.narrative.title}</h3>
                <p className="text-muted-foreground">{copy.narrative.subtitle}</p>
              </div>
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{copy.narrative.stepOf(step)}</span>
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
                <h4 className="text-lg font-semibold">{copy.narrative.step1Title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {travelerTypes.map((type) => {
                    const isSelected = selections.travelers.includes(type.id)
                    const isDisabled = isTravelerDisabled(type.id, selections.travelers)
                    return (
                      <div
                        key={type.id}
                        onClick={() => {
                          if (isDisabled) return
                          handleTravelerToggle(type.id)
                        }}
                        className={cn(
                          "relative rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-200",
                          isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-transparent bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        <type.icon
                          className={cn("w-8 h-8", isSelected ? "text-primary" : "text-muted-foreground")}
                        />
                        <div className="space-y-1">
                          <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{type.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{type.sub}</p>
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
                <h4 className="text-lg font-semibold">{copy.narrative.step2Title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {experienceTypes.map((type) => {
                    const isSelected = selections.experience === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => handleExperienceSelect(type.id)}
                        className={cn(
                          "cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                          isSelected
                            ? "border-primary ring-4 ring-primary/10"
                            : "border-transparent hover:border-primary/50"
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
                <h4 className="text-lg font-semibold">{copy.narrative.step3Title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...amenities]
                    .sort((a, b) => {
                      const aFeatured = featuredAmenityIds.has(a.id)
                      const bFeatured = featuredAmenityIds.has(b.id)
                      if (aFeatured === bFeatured) return 0
                      return aFeatured ? -1 : 1
                    })
                    .map((item) => {
                      const iconKey = taxonomyByName[item.serviceName]
                      const Icon =
                        iconKey && ICON_BY_KEY[iconKey] ? ICON_BY_KEY[iconKey] : item.defaultIcon

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
                          <Label htmlFor={item.id} className="flex items-center gap-2 cursor-pointer font-normal">
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

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button onClick={prevStep} variant="outline" size="lg" className="px-8">
                {copy.narrative.back}
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button
                onClick={nextStep}
                size="lg"
                className="px-8"
                disabled={
                  (step === 1 && selections.travelers.length === 0) || (step === 2 && !selections.experience)
                }
              >
                {copy.narrative.next} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Link href={recommendationsHref}>
                <Button
                  size="lg"
                  className="px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                >
                  {copy.narrative.seeRecommendations}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
