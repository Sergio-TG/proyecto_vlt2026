import type { Metadata } from "next"
import ChampaquiPageClient from "./ChampaquiPageClient"
import { getArchivosGaleriaExcursion94 } from "@/lib/imagekit"
import { buildFolderGaleriaUrls, withImageKitTransform } from "@/lib/imagekit.config"
import {
  CHAMPAQUI_SLUG,
  EXCURSION94_FOLDER,
  FEATURED_IMAGE_URL,
  GALLERY_EXCLUDED_FILES,
} from "@/lib/oscura-overa-champaqui"

export const metadata: Metadata = {
  title: "Trekking Cerro Champaquí | Oscura Overa",
  description:
    "Excursión guiada desde Villa Yacanto a la cumbre más alta de Córdoba (2884 msnm). Traslado 4x4, guías habilitados por la Agencia Córdoba Turismo y seguro de trekking. Desde $94.000 por persona.",
  openGraph: {
    title: "Trekking Cerro Champaquí | Oscura Overa",
    description:
      "Excursión guiada desde Villa Yacanto al Cerro Champaquí (2884 msnm) con Oscura Overa y el guía Adrián Martínez.",
    url: `https://www.vivilastermas.com/experiencias/${CHAMPAQUI_SLUG}`,
    images: [
      {
        url: FEATURED_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Vista panorámica del Cerro Champaquí — Oscura Overa",
      },
    ],
  },
  alternates: {
    canonical: `https://www.vivilastermas.com/experiencias/${CHAMPAQUI_SLUG}`,
  },
}

export default async function TrekkingCerroChampaquiPage() {
  const { folder, archivos } = await getArchivosGaleriaExcursion94()
  const excluded = new Set(GALLERY_EXCLUDED_FILES.map((name) => name.toLowerCase()))
  const galleryFiles = archivos.filter((name) => !excluded.has(name.toLowerCase()))
  const folderName = folder || EXCURSION94_FOLDER
  const thumbs = buildFolderGaleriaUrls(folderName, galleryFiles, "seoContent")
  const fulls = buildFolderGaleriaUrls(folderName, galleryFiles, "galFull")
  const galleryItems = galleryFiles.map((file, index) => ({
    file,
    thumb: thumbs[index] ?? "",
    full: fulls[index] ?? "",
  }))
  const heroSrc = withImageKitTransform(FEATURED_IMAGE_URL, "heroPage")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: "Trekking Cerro Champaquí",
    description:
      "Excursión guiada desde Villa Yacanto a la cumbre del Cerro Champaquí (2884 msnm), con traslado 4x4, guías habilitados y seguro de trekking.",
    touristType: "Trekking",
    provider: {
      "@type": "Organization",
      name: "Oscura Overa",
    },
    offers: {
      "@type": "Offer",
      price: "94000",
      priceCurrency: "ARS",
      url: `https://www.vivilastermas.com/experiencias/${CHAMPAQUI_SLUG}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChampaquiPageClient galleryItems={galleryItems} heroSrc={heroSrc} />
    </>
  )
}
