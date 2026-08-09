import type { Metadata } from "next"
import RetiroDetoxPageClient from "./RetiroDetoxPageClient"

export const metadata: Metadata = {
  title: "Programa Depuración y Vitalidad | Retiro Detox Centro Vida Abundante",
  description:
    "Retiro Detox integral del 29 de noviembre al 1 de diciembre de 2026 en Centro Vida Abundante: alimentación viva, hidroterapia, talleres y acompañamiento profesional. Modalidades locales y residenciales.",
  openGraph: {
    title: "Programa Depuración y Vitalidad | Retiro Detox Centro Vida Abundante",
    description:
      "Retiro Detox integral con alimentación viva, hidroterapia y salud consciente en Centro Vida Abundante. Del 29 de noviembre al 1 de diciembre de 2026.",
    url: "https://www.vivilastermas.com/experiencias/retiro-detox-vida-abundante",
    images: [
      {
        url: "https://ik.imagekit.io/vivilastermas/alojamientos/cabana-vida-abundante/vista-exterior-lavandas.webp",
        width: 1200,
        height: 630,
        alt: "Centro Vida Abundante — Programa Depuración y Vitalidad",
      },
    ],
  },
}

export default function RetiroDetoxVidaAbundantePage() {
  return <RetiroDetoxPageClient />
}
