"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function TermasTeaser() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

  return (
    <section ref={ref} className="relative w-full py-24 md:py-40 overflow-hidden bg-black">
      {/* Parallax Background - Trevia Style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
        <motion.div 
          style={{ y: backgroundY, scale }}
          className="h-[140%] w-full bg-cover bg-center absolute -top-[20%]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')"
            }} 
          />
        </motion.div>
      </div>

      <div className="container relative z-20 mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 max-w-4xl"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              El Corazón de tu Experiencia: <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Nuestras Termas</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
              Aguas termales a 38°C rodeadas de naturaleza virgen.
              El equilibrio perfecto entre relajación y aventura.
            </p>
          </motion.div>

          {/* Floating Stats Cards with Apple Hover Effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl py-8 items-stretch">
            {[
              { title: "38°C", subtitle: "AGUAS TERMALES", delay: 0.2 },
              { title: "Termas Night", subtitle: "SOLO ADULTOS", delay: 0.4 },
              { title: "360°", subtitle: "VISTAS NATURALES", delay: 0.6 },
              
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: stat.delay, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 h-full flex flex-col items-center justify-center text-white hover:bg-white/10 transition-all duration-500 shadow-2xl"
              >
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tighter group-hover:text-primary transition-colors leading-snug text-center whitespace-nowrap">
                  {stat.title}
                </span>
                <span className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">{stat.subtitle}</span>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex justify-center w-full pt-8"
          >
            <Link href="/termas">
                <Button size="lg" className="w-full sm:w-auto text-xl h-16 px-12 bg-white text-black hover:bg-white/90 rounded-full font-bold shadow-2xl transition-transform hover:scale-105">
                Ver Pases y Precios
                </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
