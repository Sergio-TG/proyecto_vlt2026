"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config"

const toImageKitUrl = (relativePath: string) => {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "")
  const rel = relativePath.trim().replace(/^\/+/, "")
  return `${base}/${rel}`
}

const heroContactoImage = toImageKitUrl("entorno/bg-paginas/hero-contacto.webp")

export default function ContactoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ y, scale, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={heroContactoImage}
            alt="Contacto"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-bold mb-4 drop-shadow-2xl tracking-tighter"
          >
            Contactanos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            Estamos acá para ayudarte a planificar tu escapada perfecta.
          </motion.p>
        </div>
      </section>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
              <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
              
              <div className="flex items-start gap-4 group">
                <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">WhatsApp</h3>
                  <p className="text-gray-600 mb-1">Para respuestas rápidas</p>
                  <a href="https://wa.me/5493546525404" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                    +54 9 3546 525404
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-slate-100 p-3 rounded-full text-slate-700 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Teléfono</h3>
                  <p className="text-gray-600 mb-1">Llamadas y consultas</p>
                  <a href="tel:+5493546525404" className="text-slate-700 font-medium hover:underline">
                    +54 9 3546 525404
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600 mb-1">Para consultas generales</p>
                  <a href="mailto:hola@vivilastermas.com.ar" className="text-blue-600 font-medium hover:underline">
                    hola@vivilastermas.com.ar
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ubicación</h3>
                  <p className="text-gray-600">
                    Av. Marrero S/N, Villa Yacanto, X5197<br/>
                    Córdoba, Argentina
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Preview */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-64 relative">
               <iframe 
                  src="https://www.google.com/maps?q=Av.%20Marrero%20S%2FN%2C%20Villa%20Yacanto%2C%20X5197%2C%20C%C3%B3rdoba%2C%20Argentina&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100 order-1 lg:order-2">
            <h2 className="text-2xl font-semibold mb-6">Envianos un mensaje</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Apellido</Label>
                  <Input id="lastname" placeholder="Tu apellido" className="bg-slate-50 border-slate-200" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" className="bg-slate-50 border-slate-200" />
              </div>

               <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <Input id="phone" type="tel" placeholder="+54 9 ..." className="bg-slate-50 border-slate-200" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" placeholder="Contanos qué estás buscando..." className="min-h-[150px] bg-slate-50 border-slate-200" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                  Acepto recibir información sobre promociones y novedades.
                </Label>
              </div>
              
              <Button type="submit" className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                Enviar Consulta
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
