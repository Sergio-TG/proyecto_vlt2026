"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useTransition } from "react"
import { submitContact } from "@/actions/contact"
import FaqSection from "@/components/contact/FaqSection"
import CustomImage from "@/components/common/CustomImage"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

export default function ContactoPage() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.contacto

  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-slate-50">
      <section ref={containerRef} className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y, scale, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <CustomImage
            path="/bg-paginas/hero-contacto.webp"
            folder="ENTORNO"
            alt={p.heroAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
              <h2 className="text-2xl font-semibold mb-6">{p.infoTitle}</h2>

              <div className="flex items-start gap-4 group">
                <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{p.whatsappTitle}</h3>
                  <p className="text-gray-600 mb-1">{p.whatsappHint}</p>
                  <a
                    href="https://wa.me/5493546525404"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 font-medium hover:underline"
                  >
                    +54 9 3546 525404
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-slate-100 p-3 rounded-full text-slate-700 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{p.phoneTitle}</h3>
                  <p className="text-gray-600 mb-1">{p.phoneHint}</p>
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
                  <h3 className="font-semibold text-lg">{p.emailTitle}</h3>
                  <p className="text-gray-600 mb-1">{p.emailHint}</p>
                  <a href="mailto:hola@vivilastermas.com" className="text-blue-600 font-medium hover:underline">
                    hola@vivilastermas.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{p.locationTitle}</h3>
                  <p className="text-gray-600">
                    Av. Marrero S/N, Villa Yacanto, X5197
                    <br />
                    Córdoba, Argentina
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-sm border border-slate-100 h-64 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.284798305716!2d-64.67389662446765!3d-32.13110992383821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942d59453965586d%3A0x6b7724128f260388!2sVilla%20Yacanto%2C%20C%C3%B3rdoba!5e0!3m2!1ses-419!2sar!4v1713800000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100 order-1 lg:order-2">
            <h2 className="text-2xl font-semibold mb-6">{p.formTitle}</h2>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                setResult({ type: "idle", message: "" })
                startTransition(async () => {
                  const res = await submitContact(new FormData(form))
                  setResult({ type: res.success ? "success" : "error", message: res.message })
                  if (res.success) form.reset()
                })
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{p.labelName}</Label>
                  <Input id="name" name="name" placeholder={p.phName} className="bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">{p.labelLastname}</Label>
                  <Input id="lastname" name="lastname" placeholder={p.phLastname} className="bg-slate-50 border-slate-200" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{p.labelEmail}</Label>
                <Input id="email" name="email" type="email" placeholder={p.phEmail} className="bg-slate-50 border-slate-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{p.labelPhone}</Label>
                <Input id="phone" name="phone" type="tel" placeholder={p.phPhone} className="bg-slate-50 border-slate-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{p.labelMessage}</Label>
                <Textarea id="message" name="message" placeholder={p.phMessage} className="min-h-[150px] bg-slate-50 border-slate-200" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                  {p.termsCheckbox}
                </Label>
              </div>

              <Button type="submit" disabled={isPending} className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                {isPending ? p.submitSending : p.submitIdle}
              </Button>
              {result.type !== "idle" ? (
                <p className={`text-sm font-medium ${result.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {result.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      <FaqSection />
    </div>
  )
}
