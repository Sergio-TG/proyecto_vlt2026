"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AccommodationGallery } from "@/components/accommodations/AccommodationGallery"
import { Droplets, Sun, Coffee, Mountain, Sparkles, Clock, MapPin, Navigation } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { IMAGE_FOLDERS, IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit.config"
import { HOME_VIDEOS } from "@/lib/constants"
import { HomeVideoSection } from "@/components/home/HomeVideoSection"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

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

const featureIcons = [Droplets, Sparkles, Coffee] as const

export default function TermasPage() {
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
            src="https://ik.imagekit.io/vivilastermas/galeria/termas/termas-dron002.webp?updatedAt=1775687332929&q=80&w=2070&auto=format&fit=crop"
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
            <Link href="/contacto">
              <Button size="lg" className="text-xl px-12 py-8 rounded-full shadow-2xl hover:shadow-primary/20 transition-all font-bold">
                {p.ctaReserve}
              </Button>
            </Link>
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-32"
        >
          <AccommodationGallery images={termasImages} title={p.galleryTitle} />
        </motion.div>

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
            <div className="lg:col-span-2 h-[500px] md:h-[600px] bg-slate-100 rounded-lg overflow-hidden shadow-2xl border border-slate-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3391.248039396264!2d-64.76779492458428!3d-32.17294497394666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2c1c000000001%3A0x123456789abcdef!2sEl%20Durazno%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={p.iframeTitle}
                className="w-full h-full"
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
                    <a
                      href="https://www.google.com/maps?q=TERMAS+DEL+SOL,+Paraje+El+Durazno,+Parcela+2543+3388,+X5197+Villa+Yacanto,+C%C3%B3rdoba&ftid=0x95d2c16058068703:0x73d488d0af9188f9&entry=gps&lucs=,94259551,94284478,94224825,94227247,94227248,94231188,94280568,47071704,47069508,94218641,94282134,94203019,47084304&g_ep=CAISEjI1LjMxLjAuNzg4MTIyNzc1MBgAINeCAyp1LDk0MjU5NTUxLDk0Mjg0NDc4LDk0MjI0ODI1LDk0MjI3MjQ3LDk0MjI3MjQ4LDk0MjMxMTg4LDk0MjgwNTY4LDQ3MDcxNzA0LDQ3MDY5NTA4LDk0MjE4NjQxLDk0MjgyMTM0LDk0MjAzMDE5LDQ3MDg0MzA0QgJBUg%3D%3D&skid=b9aacb98-cf21-41d7-80b7-2f3866b31e35&g_st=ipc"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
