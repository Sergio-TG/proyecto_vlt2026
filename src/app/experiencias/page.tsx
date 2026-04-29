"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Compass, Map, Sun, Heart, Stars } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const experiences = [
  {
    title: "Trekking y Senderismo",
    description: "Explorá los senderos de las Sierras Grandes. Desde caminatas suaves a orillas del río hasta ascensos desafiantes.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop",
    icon: <Map className="w-6 h-6" />,
    delay: 0.1
  },
  {
    title: "Yoga",
    description: "Conectá cuerpo y mente en nuestras clases al aire libre, rodeado por el sonido del río y la brisa serrana.",
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/yoga-mar.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Heart className="w-6 h-6" />,
    delay: 0.2
  },
  {
    title: "Sound Healing",
    description: "Sintoniza con la frecuencia de la naturaleza. Una sesión de armonización con cuencos de cuarzo y sonidos ancestrales, diseñada para equilibrar tu energía en el silencio absoluto de El Durazno.",
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/sound-healing002.JPG?q=80&w=2070&auto=format&fit=crop",
    icon: <Sun className="w-6 h-6" />,
    delay: 0.3
  },
  {
    title: "Puntos de Interés",
    description: "Aguas cristalinas, descubre el lugar perfecto para refrescarse en verano y matear en invierno.",
    image: "https://ik.imagekit.io/vivilastermas/entorno/experiencias/puntos-de-interes.webp?q=80&w=2070&auto=format&fit=crop",
    icon: <Sun className="w-6 h-6" />,
    delay: 0.4
  },
  {
    title: "Cabalgatas",
    description: "Recorré paisajes inaccesibles a pie en cabalgatas guiadas, ideales para disfrutar en pareja o en familia.",
    image: "https://plus.unsplash.com/premium_photo-1663036377788-a60733e5fb43?q=80&w=2070&auto=format&fit=crop",
    icon: <Compass className="w-6 h-6" />,
    delay: 0.5
  },
  {
    title: "Astroturismo",
    description: "Viví la experiencia de observar uno de los cielos más limpios de Córdoba, con guiado nocturno, reconocimiento de constelaciones y fotografía básica del cielo.",
    image: "https://images.unsplash.com/photo-1731332066050-47efac6e884f?q=80&w=2070&auto=format&fit=crop",
    icon: <Stars className="w-6 h-6" />,
    delay: 0.6
  }
]

export default function ExperienciasPage() {
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
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Experiencias en El Durazno"
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
            Experiencias
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            ¡Próximamente!, un destino para vivir.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {experiences.map((exp, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: exp.delay, duration: 0.8 }}
              className="group bg-slate-50/50 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-700 border border-slate-100 flex flex-col h-full"
            >
              <div className="relative h-80 overflow-hidden">
                <motion.img 
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 1.5 }}
                  src={exp.image} 
                  alt={exp.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-xl p-4 rounded-3xl text-black shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  {exp.icon}
                </div>
              </div>
              <div className="p-10 flex flex-col flex-grow space-y-4">
                <h3 className="text-3xl font-bold group-hover:text-primary transition-colors duration-300 tracking-tight">{exp.title}</h3>
                <p className="text-slate-500 mb-6 flex-grow leading-relaxed text-lg font-light">
                  {exp.description}
                </p>
                <Link href="/contacto">
                  <Button size="lg" variant="outline" className="w-full h-14 rounded-full text-lg font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20">
                    Consultar Actividad
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
