import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"
import { onlyActiveAlojamientos } from "@/lib/alojamientos-active"

const SITE_URL = "https://www.vivilastermas.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/experiencias`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${SITE_URL}/experiencias/retiro-detox-vida-abundante`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/termas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/alojamientos`, changeFrequency: "daily", priority: 0.9 },
  ]

  const { data, error } = await onlyActiveAlojamientos(
    supabase.from("alojamientos_aprobados").select("slug, created_at"),
  )

  if (error || !data) {
    return staticRoutes
  }

  const alojamientoRoutes: MetadataRoute.Sitemap = data
    .map((row) => {
      const slug = String(row.slug || "").trim()
      if (!slug) return null
      return {
        url: `${SITE_URL}/alojamientos/${slug}`,
        lastModified: row.created_at ? new Date(row.created_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return [...staticRoutes, ...alojamientoRoutes]
}
