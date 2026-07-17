import type { Metadata } from "next"
import ExperienciasPageClient from "./ExperienciasPageClient"
import { buildGaleriaPrestadorUrls } from "@/lib/imagekit.config"
import { getArchivosGaleriaPrestador } from "@/lib/imagekit"

const OSCURA_OVERA_SLUG = "oscura-overa"

export const metadata: Metadata = {
  title: "Trekking, Champaquí y Experiencias de Bienestar en Calamuchita",
  description:
    "Viví la montaña a tu manera: ascensión al Cerro Champaquí, yoga, sound healing, astroturismo, senderismo y cabalgatas en Villa Yacanto y El Durazno. ¡Reservá tu aventura!",
  openGraph: {
    title: "Trekking, Champaquí y Experiencias de Bienestar en Calamuchita",
    description:
      "Viví la montaña a tu manera: ascensión al Cerro Champaquí, yoga, sound healing, astroturismo, senderismo y cabalgatas en Villa Yacanto y El Durazno. ¡Reservá tu aventura!",
    url: "https://www.vivilastermas.com/experiencias",
  },
}

export default async function ExperienciasPage() {
  const archivos = await getArchivosGaleriaPrestador(OSCURA_OVERA_SLUG)
  const thumbUrls = buildGaleriaPrestadorUrls(OSCURA_OVERA_SLUG, archivos, "galThumb")
  const fullUrls = buildGaleriaPrestadorUrls(OSCURA_OVERA_SLUG, archivos, "galFull")

  return (
    <ExperienciasPageClient
      providerGalleries={{
        [OSCURA_OVERA_SLUG]: { thumbUrls, fullUrls },
      }}
    />
  )
}
