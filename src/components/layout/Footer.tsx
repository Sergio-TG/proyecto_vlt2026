"use client"

import Link from "next/link"
import { Facebook, Instagram, MessageCircle } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

export function Footer() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)

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
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.navTitle}</h4>
              <ul className="space-y-3 text-sm">
                {copy.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.moreTitle}</h4>
              <ul className="space-y-3 text-sm">
                {copy.footer.moreLinks.map((item) => (
                  <li key={item}>
                    <Link href="/termas" className="hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">{copy.footer.contactTitle}</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.tel}</span>
                  <span>+54 9 3546 525404</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.email}</span>
                  <span>hola@vivilastermas.com.ar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">{copy.footer.location}</span>
                  <span>{copy.footer.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex gap-4">
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all hover:scale-110">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-col max-w-md md:ml-auto w-full">
            <NewsletterSignup sourcePrefix="footer" />
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-6">
          <div className="flex flex-col md:flex-row gap-2 text-center md:text-left">
            <p>{copy.footer.copyright}</p>
            <p>
              {copy.footer.creditsPrefix}{" "}
              <a
                href="https://www.tgwebstudios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-medium text-slate-400"
              >
                TG Web Studios
              </a>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacidad" className="hover:text-primary transition-colors whitespace-nowrap">
              {copy.footer.privacy}
            </Link>
            <Link href="/terminos" className="hover:text-primary transition-colors whitespace-nowrap">
              {copy.footer.terms}
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors whitespace-nowrap">
              {copy.footer.cookieSettings}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
