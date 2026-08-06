import type { Metadata } from "next"
import { ProgramaPrintClient } from "./ProgramaPrintClient"

export const metadata: Metadata = {
  title: "Programa Depuración y Vitalidad | Ficha completa",
  description:
    "Ficha técnica del Programa Depuración y Vitalidad en Centro Vida Abundante. Podés imprimir o guardar como PDF.",
  robots: { index: false, follow: true },
}

export default function ProgramaPrintPage() {
  return <ProgramaPrintClient />
}
