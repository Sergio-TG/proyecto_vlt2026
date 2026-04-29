import type { LucideIcon } from "lucide-react"
import {
  Waves,
  PawPrint,
  Wifi,
  Car,
  Flame,
  Coffee,
  Utensils,
  Snowflake,
  Sun,
  Mountain,
  Fish,
  Accessibility,
  CheckCircle2,
  Sparkles,
  Wind,
  Tv,
  BedDouble,
  Bath,
  Users,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Waves,
  PawPrint,
  Wifi,
  Car,
  Flame,
  Coffee,
  Utensils,
  Snowflake,
  Sun,
  Mountain,
  Fish,
  Accessibility,
  Sparkles,
  Wind,
  Tv,
  BedDouble,
  Bath,
  Users,
  CheckCircle2,
}

export function getIconByKey(key: string): LucideIcon {
  const k = String(key || "").trim()
  return ICON_MAP[k] ?? CheckCircle2
}

