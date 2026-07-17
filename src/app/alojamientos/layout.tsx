import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cabañas y Alojamientos en El Durazno y Villa Yacanto | Viví las Termas",
  description:
    "Encontrá el lugar ideal para tu descanso en las sierras. Guía de alojamientos, cabañas y hoteles en Santa Rosa de Calamuchita, El Durazno y Villa Yacanto con contacto directo.",
}

export default function AlojamientosLayout({ children }: { children: React.ReactNode }) {
  return children
}
