"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ChevronDown, ShieldCheck, UserCheck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import CustomImage from "@/components/common/CustomImage"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "150px"])

  return (
    <section 
      ref={containerRef}
      className="relative h-[110vh] w-full overflow-hidden flex items-center justify-center bg-black"
    >
      {/* Background with Parallax and Apple-style scale */}
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        {/* Overlay gradiente oscuro para legibilidad superior e inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 z-10" />
        <CustomImage 
          path="termas_001.JPG" 
          folder="GALERIA" 
          alt="Termas naturales de Viví las Termas"
          fill
          priority
          className="transition-transform duration-1000 ease-out"
          sizes="100vw"
        />
      </motion.div>

      {/* Content with Smooth reveal */}
      <motion.div 
        style={{ opacity, y: textY }}
        className="relative z-20 container mx-auto px-4 text-center text-white pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto space-y-8"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-[8px] px-5 py-2.5 rounded-full border border-white/20 mb-4 shadow-2xl"
            >
                <span className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-pulse">🔥</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">Termas Night - Exclusivo</span>
            </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-2xl">
            Tu Escapada <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">Perfecta</span>
          </h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-2xl font-semibold text-white/95 tracking-wide max-w-3xl mx-auto leading-relaxed [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]"
          >
            Termas • Alojamientos Verificados • <span className="font-bold text-white underline decoration-accent/50 underline-offset-8">Experiencias Auténticas</span>
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 py-8 text-sm md:text-base font-medium text-white"
          >
            <div className="flex items-center gap-3 group px-4 py-2 rounded-xl bg-gradient-to-t from-black/40 to-transparent backdrop-blur-[2px] border border-white/5">
                <div className="p-2 rounded-full bg-green-500/30 group-hover:bg-green-500/50 transition-colors shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <span className="tracking-[0.02em] font-bold">Inspección personal</span>
            </div>
            <div className="flex items-center gap-3 group px-4 py-2 rounded-xl bg-gradient-to-t from-black/40 to-transparent backdrop-blur-[2px] border border-white/5">
                <div className="p-2 rounded-full bg-blue-500/30 group-hover:bg-blue-500/50 transition-colors shadow-lg">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                </div>
                <span className="tracking-[0.02em] font-bold">Asesoría experta</span>
            </div>
            <div className="flex items-center gap-3 group px-4 py-2 rounded-xl bg-gradient-to-t from-black/40 to-transparent backdrop-blur-[2px] border border-white/5">
                <div className="p-2 rounded-full bg-yellow-500/30 group-hover:bg-yellow-500/50 transition-colors shadow-lg">
                  <Wallet className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="tracking-[0.02em] font-bold">Sin comisiones ocultas</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6"
          >
            <Link href="/alojamientos" className="w-full md:w-auto">
                <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-black hover:bg-white/90 shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 w-full font-bold">
                Encuentra tu Alojamiento
                </Button>
            </Link>
            <Link href="/termas" className="w-full md:w-auto">
                <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-md transition-all duration-300 hover:border-white/40 w-full">
                Conoce las Termas
                </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Apple-style Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 15, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/40 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Explorar</span>
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  )
}
