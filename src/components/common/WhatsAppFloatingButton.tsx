"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

const DEFAULT_WHATSAPP_PHONE = "5493546525404"

export default function WhatsAppFloatingButton() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE).replace(/[^\d]/g, "")
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(copy.whatsapp.prefill)}`

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.whatsapp.label}
        className="pointer-events-auto outline-none no-underline"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 18px 10px 14px",
          borderRadius: "999px",
          backgroundColor: "rgba(15, 15, 15, 0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(92, 191, 183, 0.35)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(92,191,183,0.1)",
          userSelect: "none",
        }}
      >
        <MessageCircle
          style={{
            width: 26,
            height: 26,
            color: "#5cbfb7",
            flexShrink: 0,
            filter: "drop-shadow(0 0 6px rgba(92,191,183,0.5))",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          {copy.whatsapp.chip}
        </span>
      </span>
    </motion.a>
    </div>
  )
}
