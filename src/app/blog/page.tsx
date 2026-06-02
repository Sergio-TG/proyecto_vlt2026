"use client"

import Link from "next/link"
import { Playfair_Display } from "next/font/google"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { cn } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-blog",
})

const sectionFade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
}

export default function BlogPage() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.blog

  return (
    <div className={cn("min-h-screen bg-white", playfair.variable)}>
      {/* Hero — full-width ImageKit + layout alineado al sitio */}
      <section className="relative min-h-[72vh] w-full overflow-hidden flex items-center pt-20 md:pt-0">
        <div className="absolute inset-0 z-0">
          <img
            src={p.heroBackground}
            alt={p.heroAlt}
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/88 via-teal-800/78 to-slate-900/70" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <h1
                className={cn(
                  playfair.className,
                  "text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-7xl",
                )}
              >
                {p.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/92 md:text-lg lg:mx-0 mx-auto">
                {p.heroSubtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end"
            >
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/30 ring-1 ring-white/10">
                <img
                  src={p.heroCardImage}
                  alt=""
                  className="aspect-[4/3] w-full object-cover md:aspect-[5/4]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Artículos */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div {...sectionFade} className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className={cn(
                playfair.className,
                "text-3xl font-semibold text-primary md:text-4xl lg:text-5xl",
              )}
            >
              {p.latestTitle}
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">{p.latestSubtitle}</p>
          </div>
          <Button variant="outline" className="shrink-0 rounded-full border-primary/40 text-primary hover:bg-primary/5" asChild>
            <Link href="/blog">{p.viewAll}</Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-14">
          {p.posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/80"
            >
              <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <span>{post.category}</span>
                  <span className="text-slate-300">·</span>
                  <time dateTime={post.date}>{post.date}</time>
                </div>
                <h3
                  className={cn(
                    playfair.className,
                    "text-xl font-semibold text-primary md:text-2xl lg:text-[1.35rem]",
                  )}
                >
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary/85">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 md:text-base">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {p.readMore}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <NewsletterSignup
        variant="blog"
        sourcePrefix="blog-page"
        title={p.newsletterTitle}
        description={p.newsletterSubtitle}
        titleClassName={playfair.className}
      />
    </div>
  )
}
