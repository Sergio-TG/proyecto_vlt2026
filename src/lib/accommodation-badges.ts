import type { LucideIcon } from "lucide-react"
import { Gem, Heart, Leaf, Sparkles, Star, Users } from "lucide-react"

export const BADGE_DESTACADO_SLUGS = [
  "mas_pedido",
  "premium",
  "eco_friendly",
  "nuevo",
  "familiar",
  "romantico",
] as const

export type BadgeDestacadoSlug = (typeof BADGE_DESTACADO_SLUGS)[number]

export const BADGE_ADMIN_OPTIONS: Array<{ value: BadgeDestacadoSlug | ""; label: string }> = [
  { value: "", label: "Sin badge" },
  { value: "mas_pedido", label: "Más pedido" },
  { value: "premium", label: "Premium" },
  { value: "eco_friendly", label: "Eco-friendly" },
  { value: "nuevo", label: "Nuevo" },
  { value: "familiar", label: "Familiar" },
  { value: "romantico", label: "Romántico" },
]

type BadgeLabels = Record<BadgeDestacadoSlug, string>

export type ResolvedAccommodationBadge = {
  slug: BadgeDestacadoSlug
  label: string
  Icon: LucideIcon
  iconClassName: string
}

const BADGE_ICON_CONFIG: Record<
  BadgeDestacadoSlug,
  { Icon: LucideIcon; iconClassName: string }
> = {
  mas_pedido: { Icon: Star, iconClassName: "w-2.5 h-2.5 text-yellow-500 fill-yellow-500" },
  premium: { Icon: Gem, iconClassName: "w-2.5 h-2.5 text-blue-500" },
  eco_friendly: { Icon: Leaf, iconClassName: "w-2.5 h-2.5 text-green-500" },
  nuevo: { Icon: Sparkles, iconClassName: "w-2.5 h-2.5 text-violet-500" },
  familiar: { Icon: Users, iconClassName: "w-2.5 h-2.5 text-slate-500" },
  romantico: { Icon: Heart, iconClassName: "w-2.5 h-2.5 text-red-500 fill-red-500" },
}

export function isBadgeDestacadoSlug(value: string): value is BadgeDestacadoSlug {
  return (BADGE_DESTACADO_SLUGS as readonly string[]).includes(value)
}

export function normalizeBadgeDestacado(value: unknown): BadgeDestacadoSlug | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return isBadgeDestacadoSlug(trimmed) ? trimmed : null
}

export function resolveAccommodationBadge(
  badgeDestacado: unknown,
  labels: BadgeLabels,
): ResolvedAccommodationBadge | null {
  const slug = normalizeBadgeDestacado(badgeDestacado)
  if (!slug) return null

  const config = BADGE_ICON_CONFIG[slug]
  return {
    slug,
    label: labels[slug],
    Icon: config.Icon,
    iconClassName: config.iconClassName,
  }
}
