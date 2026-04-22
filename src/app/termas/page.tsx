"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AccommodationGallery } from "@/components/accommodations/AccommodationGallery"
import { Droplets, Sun, Coffee, Mountain, Sparkles, Clock, MapPin, Navigation } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { IMAGE_FOLDERS, IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config"

const toImageKitUrl = (relativePath: string) => {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "")
  const rel = relativePath.trim().replace(/^\/+/, "")
  return `${base}/${rel}`
}

const termasImageFiles = [
  "pileta-interior001.webp",
  "pileta-interior002.webp",
  "termas-dron003.webp",
  "termas-aerea001.webp",
  "pileta-exterior001.webp",
]

const termasImages = termasImageFiles.map((file) =>
  toImageKitUrl(`${IMAGE_FOLDERS.GALERIA}/termas/${file}`)
)

export default function TermasPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Apple Parallax */}
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ y, scale, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="https://ik.imagekit.io/vivilastermas/galeria/termas/termas-dron002.webp?updatedAt=1775687332929&q=80&w=2070&auto=format&fit=crop"
            alt="Termas del Sol - Paisaje"
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
            Termas del Sol
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            Un oasis de relajación en el corazón de El Durazno
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        
        {/* Intro Section with Smooth Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto text-center mb-32 space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">Bienvenido al <br/><span className="text-primary">Paraíso Termal</span></h2>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light max-w-3xl mx-auto">
            Sumergite en un entorno donde el agua calma, el cuerpo se suelta y el alma respira. 
            En <strong>Termas del Sol</strong>, cada detalle está pensado para tu bienestar. 
            Contamos con aguas climatizadas artificialmente con temperaturas de hasta 40°C, 
            rodeadas de la imponente naturaleza de las Sierras Grandes.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link href="/contacto">
              <Button size="lg" className="text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-primary/20 transition-all font-bold">Reservar Pase</Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid with Apple-style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {[
            { 
              icon: Droplets, 
              title: "22 Piletas", 
              desc: "Circuito de piscinas a diferentes temperaturas, incluyendo una cubierta y otras con borde infinito hacia las sierras.",
              color: "blue",
              delay: 0.1
            },
            { 
              icon: Sparkles, 
              title: "Spa & Relax", 
              desc: "Masajes descontracturantes, fangoterapia, sauna seco y húmedo para una renovación total.",
              color: "amber",
              delay: 0.2
            },
            { 
              icon: Coffee, 
              title: "Gastronomía", 
              desc: "Disfrutá de nuestro servicio de cafetería y restaurante con vistas panorámicas increíbles.",
              color: "green",
              delay: 0.3
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="bg-slate-50/50 p-12 rounded-[2.5rem] text-center space-y-6 hover:bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100"
            >
              <div className={`bg-${feature.color}-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-${feature.color}-600 transform -rotate-6 group-hover:rotate-0 transition-transform`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Gallery Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-32"
        >
          <AccommodationGallery 
            images={termasImages} 
            title="Termas del Sol" 
          />
        </motion.div>

        {/* Info & Logistics with Trevia Parallax */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-slate-950 text-white rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <div className="p-12 md:p-20 space-y-10 flex flex-col justify-center">
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Información Útil</h3>
            
            <div className="space-y-8">
              {[
                { icon: Clock, title: "Horarios", desc: "Abierto todos los días de 9:00 a 18:00 hs." },
                { icon: Sun, title: "Qué incluye el pase", desc: "Acceso a todas las piletas, bata, locker, clase de yoga y armonización sonora." },
                { icon: Mountain, title: "Ubicación", desc: "A solo metros de Hostería El Durazno. Acceso fácil para todo tipo de vehículos." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 group">
                  <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-lg font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/mapa" className="pt-6">
              <Button className="bg-white text-slate-950 hover:bg-slate-100 font-black px-10 py-8 h-auto text-xl rounded-full shadow-2xl transition-transform hover:scale-105">
                Ver Mapa de Ubicación
              </Button>
            </Link>
          </div>
          
          <div className="relative h-full min-h-[400px] overflow-hidden group">
             <motion.img 
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop" 
              alt="Spa Relax"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/50 md:to-slate-950" />
          </div>
        </motion.div>

      </div>

      {/* Mapa Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">Nuestra Ubicación</h2>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light mt-6">
              Encuéntranos en el corazón de El Durazno, un paraíso natural de fácil acceso.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Main Map Area */}
            <div className="lg:col-span-2 h-[500px] md:h-[600px] bg-slate-100 rounded-lg overflow-hidden shadow-2xl border border-slate-200 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3391.248039396264!2d-64.76779492458428!3d-32.17294497394666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2c1c000000001%3A0x123456789abcdef!2sEl%20Durazno%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Ubicación Termas del Sol"
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6 flex flex-col justify-center">
              <Card className="border-none shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="w-8 h-8 text-primary" />
                    Termas del Sol
                  </CardTitle>
                  <CardDescription className="text-base">El Durazno, Valle de Calamuchita</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-600">
                    Ubicadas en un entorno natural privilegiado, rodeadas de sierras y ríos cristalinos. Un lugar único para conectar con la naturaleza.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-900">Coordenadas GPS:</div>
                    <div className="font-mono text-sm bg-slate-100 p-3 rounded-lg text-slate-700">
                      -32.172945, -64.767795
                    </div>
                  </div>

                  <Button className="w-full gap-2 h-12 text-base font-bold" asChild>
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=El+Durazno+Cordoba" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Navigation className="w-5 h-5" />
                      Cómo Llegar con Google Maps
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
