"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

type FAQItem = {
  question: string
  answer: string
}

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "¿Cómo hago una reserva?",
    answer:
      "Podés consultar disponibilidad y reservar por WhatsApp, teléfono o formulario web.",
  },
  {
    question: "¿La reserva tiene costo adicional?",
    answer:
      "No, la gestión de reserva no tiene costo extra para el huésped.",
  },
  {
    question: "¿Cómo elijo el alojamiento ideal según mis preferencias?",
    answer:
      "Te ayudamos a encontrar la opción que mejor se adapte a lo que buscás. Solo contanos qué es importante para vos.",
  },
  {
    question: "¿Puedo modificar mi reserva?",
    answer:
      "Sí, las modificaciones están sujetas a disponibilidad y a las políticas de cada alojamiento. Si necesitás cambiar fechas, cantidad de huéspedes o cualquier detalle de tu estadía, contactanos lo antes posible para ayudarte a gestionar el cambio.",
  },
  {
    question: "¿Qué hace diferente a esta central de reservas?",
    answer:
      "No solo te ayudamos a encontrar alojamiento: diseñamos experiencias de bienestar y conexión con la naturaleza para que tu estadía sea más significativa.",
  },
  {
    question: "¿Hay beneficios por reservar con la central?",
    answer:
      "Acceso a promociones, asesoramiento personalizado y experiencias integradas.",
  },
  {
    question: "¿Puedo hablar con una persona antes de reservar?",
    answer: "Sí, el asesoramiento es personalizado.",
  },
  {
    question: "¿Trabajan con alojamientos habilitados?",
    answer: "Sí, trabajamos con alojamientos seleccionados y verificados.",
  },
  {
    question: "¿Dónde conviene alojarse?",
    answer:
      "Depende de lo que busques: más conexión con la naturaleza, cercanía al río o mayor accesibilidad.",
  },
  {
    question: "¿Puedo reservar experiencias además del alojamiento?",
    answer: "Sí, podés sumar experiencias de bienestar, naturaleza y actividades complementarias.",
  },
]

type FaqSectionProps = {
  title?: string
  subtitle?: string
  items?: FAQItem[]
}

export default function FaqSection({
  title = "Preguntas Frecuentes",
  subtitle = "Resolviendo tus dudas más comunes.",
  items = DEFAULT_FAQ_ITEMS,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  const leftColumn = items.filter((_, idx) => idx % 2 === 0)
  const rightColumn = items.filter((_, idx) => idx % 2 !== 0)

  return (
    <section className="px-4 pb-20 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h2>
          <p className="mt-3 text-lg text-slate-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-5">{leftColumn.map((item, idx) => renderItem(item, idx * 2, openIndex, setOpenIndex))}</div>
          <div className="space-y-5">{rightColumn.map((item, idx) => renderItem(item, idx * 2 + 1, openIndex, setOpenIndex))}</div>
        </div>
      </div>
    </section>
  )
}

function renderItem(
  item: FAQItem,
  index: number,
  openIndex: number | null,
  setOpenIndex: React.Dispatch<React.SetStateAction<number | null>>
) {
  const isOpen = openIndex === index
  return (
    <article
      key={`${item.question}-${index}`}
      className="rounded-sm border border-[#b6eeeb] bg-[#f2f9f9] px-5 py-5 transition-colors duration-200"
    >
      <button
        type="button"
        onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-semibold leading-snug text-slate-900">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ${isOpen ? "mt-4 max-h-52 opacity-100" : "mt-0 max-h-0 opacity-0"}`}
      >
        <p className="border-t border-[#88ded9] pt-4 text-base leading-relaxed text-slate-600">{item.answer}</p>
      </div>
    </article>
  )
}
