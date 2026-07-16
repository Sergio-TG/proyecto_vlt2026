import ExperienciasPageClient from "./ExperienciasPageClient"
import { buildGaleriaPrestadorUrls } from "@/lib/imagekit.config"
import { getArchivosGaleriaPrestador } from "@/lib/imagekit"

const OSCURA_OVERA_SLUG = "oscura-overa"

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
