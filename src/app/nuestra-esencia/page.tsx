"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function NuestraEsenciaPage() {
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
            src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop"
            alt="Bienestar en El Durazno"
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
            Nuestra Esencia
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            El alma de las termas y del turismo de bienestar en El Durazno.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 max-w-5xl space-y-24">
        
        {/* Intro Section with Smooth Reveal */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="space-y-8 text-center md:text-left"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            El alma de las termas en <br/><span className="text-primary text-5xl md:text-7xl">El Durazno</span>
          </h2>
          <div className="space-y-6 text-xl md:text-2xl text-slate-500 font-light leading-relaxed">
            <p>
              Entre las sierras de Calamuchita y el murmullo del río El Durazno, nace una idea simple y poderosa:
              crear un refugio donde el tiempo se afloja, el cuerpo se calma y la mente vuelve a respirar. Viví las Termas
              no es solo una Central de Experiencias; es la puerta de entrada a un universo de turismo de bienestar en El
              Durazno, donde cada detalle está pensado para que te sientas acompañado, protegido y profundamente inspirado.
            </p>
            <p>
              En un mundo de agendas saturadas, ruido urbano y pantallas encendidas hasta tarde, aquí proponemos lo
              contrario: silencio, cielo abierto, termas en Córdoba, caminatas lentas, agua que abriga y alojamientos que
              invitan a quedarse un poco más. Nuestro propósito es sencillo: que encuentres en este rincón de las sierras
              ese espacio íntimo que hace tanto estás buscando.
            </p>
          </div>
        </motion.section>

        {/* Feature Image with Trevia Parallax Effect */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group"
        >
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 2 }}
            src="https://images.unsplash.com/photo-1551301622-6fa51afe75a0?q=80&w=2070&auto=format&fit=crop"
            alt="Termas y naturaleza en calma"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>

        {/* Vision Section with Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <motion.section 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">La visión de Sergio</h2>
            <h3 className="text-2xl font-semibold text-primary/80 italic">
              "Un refugio curado personalmente"
            </h3>
            <div className="space-y-4 text-lg text-slate-500 leading-relaxed font-light">
              <p>
                Sergio sueña Viví las Termas como lo que a él mismo le gustaría encontrar cuando viaja: un lugar donde no haya
                que adivinar qué elegir, ni perder tiempo probando al azar. Su visión es crear una red de experiencias
                confiables, auténticas y cuidadosamente seleccionadas, que combinen relax, aventura suave y bienestar real.
              </p>
              <p>
                Cada alojamiento, cada paseo y cada propuesta que ves en esta Central de Experiencias ha pasado por el filtro
                más importante: el humano. Sergio recorre, visita, prueba y conversa con anfitriones, terapeutas y prestadores
                locales para asegurarse de que lo que te recomienda está a la altura de lo que promete.
              </p>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-6 bg-slate-50 p-12 rounded-[2.5rem] border border-slate-100"
          >
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">El factor humano</h2>
            <h3 className="text-2xl font-semibold text-primary">
              Mariela Fernández
            </h3>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Directora de Experiencias y Bienestar</p>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed font-light">
              <p>
                Con más de quince años dedicada al mundo del bienestar y las terapias alternativas, Mariela ha sido reconocida por Córdoba Turismo por su trayectoria.
              </p>
              <p>
                Su rol va mucho más allá de coordinar agendas. Mariela diseña y personaliza cada circuito de bienestar según
                el perfil de cada huésped, supervisa la calidad de las terapias y acompaña a los visitantes para que cada experiencia tenga sentido y propósito.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Pillars Section with Grid Cards */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">Nuestros Pilares</h2>
            <p className="text-xl text-slate-400 font-light uppercase tracking-[0.3em]">El manifiesto de Viví las Termas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Conexión Natural", desc: "Todo empieza y termina en el entorno: ríos, bosques, cielos abiertos y silencio. Aquí la naturaleza no es decoración, es protagonista." },
              { title: "Sanación por Agua", desc: "Las termas son el hilo conductor. Creemos en su poder para aliviar, aflojar tensiones y devolvernos al cuerpo." },
              { title: "Atención Real", desc: "Escuchamos tu historia, tus tiempos y tus necesidades. No armamos paquetes masivos, sino experiencias que se adaptan a vos." },
              { title: "Autenticidad", desc: "Trabajamos con personas y lugares reales. Cada alojamiento está verificado y elegido porque refleja el espíritu de El Durazno." }
            ].map((pilar, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500"
              >
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{pilar.title}</h4>
                <p className="text-lg text-slate-500 leading-relaxed font-light">
                  {pilar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Commitment Section with Dark Card Style */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-950 text-white p-12 md:p-24 rounded-[4rem] shadow-2xl space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Nuestro Compromiso</h2>
            <p className="text-xl text-slate-400 font-light">Qué te prometemos cuando elegís Viví las Termas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: "Alojamientos Verificados", desc: "Cada espacio ha sido visitado, evaluado y acompañado personalmente por Sergio." },
              { title: "Calidad en Bienestar", desc: "Mariela supervisa cada terapia para que tu experiencia sea segura y profesional." },
              { title: "Sin Preocupaciones", desc: "Te ayudamos a combinar todo de forma fluida. Vos solo disfrutás." },
              { title: "Diseño a Medida", desc: "Ajustamos duración, intensidad y presupuesto para que tu viaje ideal sea posible." }
            ].map((item, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-2xl font-bold text-primary">{item.title}</h4>
                <p className="text-lg text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-10 py-12"
        >
          <h2 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tight">Tu próxima historia <br/> empieza en El Durazno</h2>
          <p className="text-xl md:text-2xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
            Si sentís que este lugar resuena con lo que estás buscando, es porque probablemente ya estás listo para vivirlo.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block pt-6"
          >
            <Link href="/contacto">
              <Button size="lg" className="px-16 py-10 text-2xl rounded-full shadow-2xl font-black bg-primary hover:bg-primary/90 transition-all">
                Contáctanos Ahora
              </Button>
            </Link>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}
