"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

const DEFAULT_WHATSAPP_PHONE = "5493546525404"

export default function WhatsAppFloatingButton() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE).replace(/[^\d]/g, "")
  const prefill = "Hola, quiero comenzar mi experiencia de bienestar en Viví las Termas. ¿Me podrían asesorar?"
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(prefill)}`

  const button = (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2147483647,
        outline: "none",
        textDecoration: "none",
      }}
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
          ¿Dudas? Escríbenos
        </span>
      </span>
    </motion.a>
  )

  if (!mounted) return null
  return createPortal(button, document.body)
}