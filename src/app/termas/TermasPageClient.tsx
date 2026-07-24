"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { TermasGallery } from "@/components/termas/TermasGallery"
import { Droplets, Sun, Coffee, Mountain, Sparkles, Clock, MapPin, Navigation } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { getResolvedImageKitBase } from "@/lib/imagekit.config"
import { HOME_VIDEOS } from "@/lib/constants"
import { HomeVideoSection } from "@/components/home/HomeVideoSection"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { ANALYTICS_EVENT_TYPES, trackEvent, trackServiceInterest } from "@/services/analytics"

const MapaTermas = dynamic(
  () => import("@/components/termas/MapaTermas").then((mod) => ({ default: mod.MapaTermas })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 animate-pulse">
        <MapPin className="h-8 w-8 text-primary/40" />
        <span className="text-sm font-medium text-slate-400">Cargando mapa…</span>
      </div>
    ),
  },
)

const termasHeroImage = `${getResolvedImageKitBase()}/galeria/termas/termas-dron002.webp?updatedAt=1775687332929&q=80&w=2070&auto=format&fit=crop`

/** Centro del mapa (Termas del Sol, Chilecito). */
const TERMAS_MAP_POSITION: [number, number] = [-32.172945, -64.767795]
const TERMAS_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/z7DP2CRk5QnJKgHK8"

const featureIcons = [Droplets, Sparkles, Coffee] as const

export default function TermasPageClient({
  galleryThumbUrls,
  galleryFullUrls,
}: {
  galleryThumbUrls: string[]
  galleryFullUrls: string[]
}) {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.termas

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-white">
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={termasHeroImage}
            alt={p.heroAlt}
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
            {p.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-xl md:text-3xl max-w-2xl font-light drop-shadow-md text-white/90"
          >
            {p.heroSubtitle}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto text-center mb-32 space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
            {p.introLine1} <br />
            <span className="text-primary">{p.introHighlight}</span>
          </h2>
          <p
            className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: p.introHtml }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <a
              href="https://wa.me/5493546563187?text=%C2%A1Hola%21%20Quiero%20reservar%20un%20pase%20para%20%2ATermas%20del%20Sol%2A.%20Vengo%20del%20sitio%20web%20%2AViv%C3%AD%20las%20Termas%2A.%20%C2%BFMe%20podr%C3%ADan%20brindar%20informaci%C3%B3n%20sobre%20tarifas%20y%20disponibilidad%3F%20%C2%A1Muchas%20gracias%21"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent(ANALYTICS_EVENT_TYPES.CLIC_RESERVA_TERMAS)
                trackServiceInterest("Termas del Sol")
              }}
            >
              <Button size="lg" className="text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-primary/20 transition-all font-bold">
                {p.ctaReserve}
              </Button>
            </a>
          </motion.div>
        </motion.div>

        <HomeVideoSection src={HOME_VIDEOS.TERMAS_DRON} className="w-full h-auto object-cover aspect-video" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {p.features.map((feature, idx) => {
            const Icon = featureIcons[idx]
            const colorWrap = ["bg-blue-100 text-blue-600", "bg-amber-100 text-amber-600", "bg-green-100 text-green-600"][idx] ?? "bg-blue-100 text-blue-600"
            const delay = 0.1 * (idx + 1)
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay, duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="bg-slate-50/50 p-12 rounded-[2.5rem] text-center space-y-6 hover:bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100"
              >
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transform -rotate-6 group-hover:rotate-0 transition-transform ${colorWrap}`}
                >
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg font-light">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {galleryThumbUrls.length > 0 && galleryFullUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-32"
          >
            <TermasGallery
              thumbUrls={galleryThumbUrls}
              fullUrls={galleryFullUrls}
              photoContextTitle={p.galleryTitle}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-slate-950 text-white rounded-[1rem] overflow-hidden shadow-2xl"
        >
          <div className="p-12 md:p-20 space-y-10 flex flex-col justify-center">
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">{p.infoTitle}</h3>

            <div className="space-y-8">
              {p.infoRows.map((item, idx) => {
                const icons = [Clock, Sun, Mountain]
                const Icon = icons[idx] ?? Clock
                return (
                  <div key={item.title} className="flex items-start gap-6 group">
                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-lg font-light">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative h-full min-h-[400px] overflow-hidden group">
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
              alt={p.spaRelaxAlt}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/50 md:to-slate-950" />
          </div>
        </motion.div>
      </div>

      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">{p.mapTitle}</h2>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light mt-6">{p.mapSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div
              className="lg:col-span-2 relative h-[500px] md:h-[600px] bg-slate-100 rounded-lg overflow-hidden shadow-2xl border border-slate-200"
              role="region"
              aria-label={p.iframeTitle}
            >
              <MapaTermas
                position={TERMAS_MAP_POSITION}
                googleMapsHref={TERMAS_GOOGLE_MAPS_URL}
                titulo={p.cardTitle}
                className="absolute inset-0 h-full w-full"
              />
            </div>

            <div className="space-y-6 flex flex-col justify-center">
              <Card className="border-none shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="w-8 h-8 text-primary" />
                    {p.cardTitle}
                  </CardTitle>
                  <CardDescription className="text-base">{p.cardRegion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-600">{p.cardBody}</p>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-900">{p.gpsLabel}</div>
                    <div className="font-mono text-sm bg-slate-100 p-3 rounded-lg text-slate-700">
                      -32.172945, -64.767795
                    </div>
                  </div>

                  <Button className="w-full gap-2 h-12 text-base font-bold" asChild>
                    <a href={TERMAS_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-5 h-5" />
                      {p.directionsBtn}
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
