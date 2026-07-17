import type { Metadata } from "next"
import TermasPageClient from "./TermasPageClient"
import { buildGaleriaTermasUrls } from "@/lib/imagekit.config"
import { getArchivosGaleriaTermas } from "@/lib/imagekit"

export const metadata: Metadata = {
  title: "Termas del Sol El Durazno | Piletas Climatizadas y Spa | Viví las Termas",
  description:
    "Disfrutá de 22 piletas climatizadas artificialmente y servicios de spa exclusivos en medio de la naturaleza de El Durazno, Valle de Calamuchita. Reservá tu día de relax absoluto.",
  openGraph: {
    title: "Termas del Sol El Durazno | Piletas Climatizadas y Spa | Viví las Termas",
    description:
      "Disfrutá de 22 piletas climatizadas artificialmente y servicios de spa exclusivos en medio de la naturaleza de El Durazno, Valle de Calamuchita. Reservá tu día de relax absoluto.",
    url: "https://www.vivilastermas.com/termas",
  },
}

export default async function TermasPage() {
  const archivos = await getArchivosGaleriaTermas()
  const galleryThumbUrls = buildGaleriaTermasUrls(archivos, "galThumb")
  const galleryFullUrls = buildGaleriaTermasUrls(archivos, "galFull")

  return (
    <TermasPageClient galleryThumbUrls={galleryThumbUrls} galleryFullUrls={galleryFullUrls} />
  )
}
