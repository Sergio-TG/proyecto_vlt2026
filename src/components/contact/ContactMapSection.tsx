"use client"

import * as React from "react"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const LOCATION = {
  address: "Av. Marrero S/N, Villa Yacanto, X5197\nCórdoba, Argentina",
}

export function ContactMapSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[420px] space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Contacto</h2>
              <p className="text-slate-500 font-medium">
                Escribinos y te ayudamos a elegir el alojamiento ideal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">WhatsApp</h3>
                  <p className="text-slate-500 mb-1">Consultas y reservas</p>
                  <a href="https://wa.me/5493546525404" target="_blank" rel="noreferrer" className="text-green-600 font-medium hover:underline">
                    +54 9 3546 525404
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">Email</h3>
                  <p className="text-slate-500 mb-1">Para consultas generales</p>
                  <a href="mailto:hola@vivillastermas.com.ar" className="text-blue-600 font-medium hover:underline">
                    hola@vivilastermas.com.ar
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">Teléfono</h3>
                  <p className="text-slate-500 mb-1">Llamadas</p>
                  <a href="tel:+5493546525404" className="text-indigo-600 font-medium hover:underline">
                    +54 9 3546 525404
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">Dirección</h3>
                  <p className="text-slate-500 mb-1">Cómo llegar</p>
                  <p className="text-slate-900 font-medium whitespace-pre-line">{LOCATION.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/5493546525404"
                target="_blank"
                rel="noreferrer"
                className="inline-block w-full"
              >
                <Button className="w-full h-12 rounded-xl font-black">Contactar por WhatsApp</Button>
              </a>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="h-[400px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                title="Mapa - Viví Las Termas"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Av.%20Marrero%20S%2FN%2C%20Villa%20Yacanto%2C%20X5197%2C%20C%C3%B3rdoba%2C%20Argentina&output=embed"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
