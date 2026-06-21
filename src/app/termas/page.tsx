import TermasPageClient from "./TermasPageClient"
import { buildGaleriaTermasUrls } from "@/lib/imagekit.config"
import { getArchivosGaleriaTermas } from "@/lib/imagekit"

export default async function TermasPage() {
  const archivos = await getArchivosGaleriaTermas()
  const galleryThumbUrls = buildGaleriaTermasUrls(archivos, "galThumb")
  const galleryFullUrls = buildGaleriaTermasUrls(archivos, "galFull")

  return (
    <TermasPageClient galleryThumbUrls={galleryThumbUrls} galleryFullUrls={galleryFullUrls} />
  )
}
