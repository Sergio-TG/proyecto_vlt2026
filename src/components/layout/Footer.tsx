"use client"

import Link from "next/link"
import { Facebook, Instagram, MessageCircle } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const FOOTER_SOCIAL = {
  instagram: "https://www.instagram.com/termasdelsoleldurazno/",
  facebook: "https://www.facebook.com/termasdelsoleldurazno2",
} as const

const WHATSAPP_PHONE = "5493546525404"

export function Footer() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(copy.whatsapp.prefill)}`

  return (
    <footer className="bg-slate-900 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 pb-16 border-b border-slate-800">
          <div className="max-w-xs">
            <Link href="/" className="inline-block mb-2">
              <img src="/logotipo.png" alt={copy.header.logoAlt} className="h-16 w-auto brightness-0 invert object-contain" />
            </Link>
            <p className="text-slate-400 text-xs italic mb-6 tracking-widest uppercase">
              {copy.footer.tagline}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              {copy.footer.blurb}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 flex-grow">
            <div>
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.exploreTitle}</h4>
              <ul className="space-y-3 text-sm">
                {copy.footer.exploreLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-slate-400 hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.resourcesTitle}</h4>
              <ul className="space-y-3 text-sm">
                {copy.footer.resourcesLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-slate-400 hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/socios" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    {copy.footer.sociosCta}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.contactTitle}</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.tel}</span>
                  <a
                    href="https://wa.me/5493546525404"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-300 hover:text-primary"
                  >
                    +54 9 3546 525404
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.email}</span>
                  <a
                    href="mailto:hola@vivilastermas.com.ar?subject=Consulta%20Viv%C3%AD%20Las%20Termas"
                    className="no-underline transition-colors duration-300 hover:text-primary"
                  >
                    hola@vivilastermas.com.ar
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.location}</span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=-32.10208670668308,-64.75739709664914"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-300 hover:text-primary"
                  >
                    {copy.footer.address}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex gap-4">
            <a
              href={FOOTER_SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram — Termas del Sol El Durazno"
              className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={FOOTER_SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook — Termas del Sol El Durazno"
              className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.whatsapp.label}
              className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-col max-w-md md:ml-auto w-full">
            <NewsletterSignup sourcePrefix="footer" />
          </div>
        </div>

        <div className="relative z-0 mt-16 border-t border-slate-800 pt-8 pb-20 md:pb-16 lg:pb-20">
          <div className="relative z-10 flex w-full flex-col gap-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-left">
              <p>{copy.footer.copyright}</p>
              <p>
                {copy.footer.creditsPrefix}{" "}
                <a
                  href="https://www.tgwebstudios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-400 transition-colors hover:text-primary"
                >
                  TG Web Studios
                </a>
              </p>
            </div>

            <nav
              aria-label={locale === "es" ? "Enlaces legales" : "Legal links"}
              className="relative z-10 flex flex-wrap gap-x-6 gap-y-2 md:justify-end"
            >
              <Link
                href="/privacidad"
                className="whitespace-nowrap transition-colors hover:text-primary"
              >
                {copy.footer.privacy}
              </Link>
              <Link href="/terminos" className="whitespace-nowrap transition-colors hover:text-primary">
                {copy.footer.terms}
              </Link>
              <Link href="/cookies" className="whitespace-nowrap transition-colors hover:text-primary">
                {copy.footer.cookieSettings}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
