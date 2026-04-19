"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Mail, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const MapStaticLocation = dynamic(() => import("@/components/maps/MapStaticLocation").then((m) => m.MapStaticLocation), {
  ssr: false,
})

const LOCATION = {
  lat: -32.1298,
  lng: -64.7686,
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

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</div>
                  <div className="text-slate-800 font-bold">+54 9 3546 525404</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">Email</div>
                  <div className="text-slate-800 font-bold">hola@vivillastermas.com.ar</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">Dirección</div>
                  <div className="text-slate-800 font-bold whitespace-pre-line">{LOCATION.address}</div>
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
            <MapStaticLocation lat={LOCATION.lat} lng={LOCATION.lng} title="Viví Las Termas" address={LOCATION.address} />
          </div>
        </div>
      </div>
    </section>
  )
}

