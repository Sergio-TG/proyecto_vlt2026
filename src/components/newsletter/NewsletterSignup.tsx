"use client"

import * as React from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"

type NewsletterVariant = "footer" | "home" | "alojamiento" | "blog"

export function NewsletterSignup({
  variant = "footer",
  sourcePrefix = "footer",
  source,
  title,
  description,
  sectionClassName,
  titleClassName,
  descriptionClassName,
}: {
  variant?: NewsletterVariant
  sourcePrefix?: string
  source?: string
  title?: string
  description?: string
  sectionClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState<string | null>(null)
  const pathname = usePathname()
  const { locale } = useLanguage()
  const c = getSiteCopy(locale)

  const displayTitle =
    title?.trim() ||
    (variant === "footer" ? c.newsletter.titleFooter : c.newsletter.titleHome)
  const displayDescription =
    description?.trim() ||
    (variant === "footer" ? c.newsletter.descFooter : c.newsletter.descHome)

  const baseSource = (source || "").trim() || (variant === "footer" ? sourcePrefix : variant)
  const sourceValue = `${baseSource}:${pathname || ""}`.slice(0, 80)

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return

    setStatus("loading")
    setMessage(null)

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        body: new FormData(e.currentTarget),
      })
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || c.newsletter.errorGeneric)
      }
      setStatus("success")
      setMessage(json?.message || c.newsletter.thanks)
      setEmail("")
      setTimeout(() => setStatus("idle"), 5000)
    } catch (err: unknown) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : c.newsletter.errorGeneric)
    }
  }

  if (variant === "blog") {
    return (
      <section
        className={cn("w-full bg-slate-50 py-16 md:py-24 border-y border-slate-100", sectionClassName)}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className={cn(
                "text-3xl md:text-5xl font-semibold tracking-tight text-slate-900",
                titleClassName,
              )}
            >
              {displayTitle}
            </h2>
            <p
              className={cn(
                "mt-4 text-lg text-slate-600 max-w-xl mx-auto font-light leading-relaxed",
                descriptionClassName,
              )}
            >
              {displayDescription}
            </p>

            <div className="mt-10 max-w-xl mx-auto">
              {status === "success" ? (
                <div className="flex items-center justify-center gap-3 bg-primary/10 text-slate-900 p-5 rounded-2xl border border-primary/15 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primary" />
                  <p className="text-sm font-semibold">{message || c.newsletter.thanks}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                    <input
                      type="email"
                      name="email"
                      placeholder={c.newsletter.placeholderHome}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                      className="bg-white border border-slate-200 text-slate-900 min-w-0 flex-1 rounded-xl py-3.5 pl-5 pr-5 sm:pl-6 shadow-sm focus:ring-2 focus:ring-primary/30 outline-none transition-all disabled:opacity-50 text-sm placeholder:text-slate-400"
                    />
                    <input type="hidden" name="source" value={sourceValue} />
                    <Button
                      type="submit"
                      disabled={status === "loading" || !email}
                      className="rounded-xl px-6 sm:px-8 min-w-[148px] shrink-0 justify-center font-bold h-[46px] sm:h-auto text-sm shadow-lg"
                    >
                      {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : c.newsletter.submitHome}
                    </Button>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{c.newsletter.disclaimerHome}</div>
                  {status === "error" && (
                    <p className="text-xs text-destructive font-semibold mt-1">{message || c.newsletter.errorGeneric}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === "home" || variant === "alojamiento") {
    return (
      <section className="w-full bg-teal-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">{displayTitle}</h2>
            <p className="mt-4 text-white/90 font-medium max-w-xl mx-auto">{displayDescription}</p>

            <div className="mt-10 max-w-xl mx-auto">
              {status === "success" ? (
                <div className="flex items-center justify-center gap-3 bg-white/10 text-white p-5 rounded-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-semibold">{message || c.newsletter.thanks}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-3">
                    <input
                      type="email"
                      name="email"
                      placeholder={c.newsletter.placeholderHome}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                      className="bg-white/95 border border-white/30 text-slate-900 min-w-0 flex-1 rounded-xl py-3.5 pl-5 pr-5 sm:pl-6 sm:pr-5 focus:ring-2 focus:ring-white/40 outline-none transition-all disabled:opacity-50 text-sm placeholder:text-slate-500"
                    />
                    <input type="hidden" name="source" value={sourceValue} />
                    <Button
                      type="submit"
                      disabled={status === "loading" || !email}
                      className="rounded-xl px-6 sm:px-8 min-w-[148px] shrink-0 justify-center font-black h-[46px] sm:h-auto text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
                    >
                      {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : c.newsletter.submitHome}
                    </Button>
                  </div>

                  <div className="text-[11px] text-white/70 font-medium mt-2 text-center">{c.newsletter.disclaimerHome}</div>

                  {status === "error" && (
                    <p className="text-xs text-red-200 font-semibold mt-1">{message || c.newsletter.errorGeneric}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <h4 className="text-white font-bold text-lg mb-2">{displayTitle}</h4>
      <p className="mb-4 text-sm text-slate-400">{displayDescription}</p>

      {status === "success" ? (
        <div className="flex items-center gap-3 bg-green-500/10 text-green-400 p-4 rounded-xl border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message || c.newsletter.thanks}</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder={c.newsletter.placeholderFooter}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50 text-sm"
            />
            <input type="hidden" name="source" value={sourceValue} />
            <Button type="submit" disabled={status === "loading" || !email} className="rounded-xl px-6 font-bold h-[42px] text-sm">
              {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : c.newsletter.submitFooter}
            </Button>
          </div>
          {status === "error" && (
            <p className="text-xs text-red-400 ml-1">{message || c.newsletter.errorGeneric}</p>
          )}
        </form>
      )}
    </div>
  )
}
