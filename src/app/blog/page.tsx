"use client"

import * as React from "react"
import Link from "next/link"
import { Playfair_Display } from "next/font/google"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { cn } from "@/lib/utils"
import { fetchPublishedBlogPosts, type BlogPostContent } from "@/lib/blog"

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
  const [posts, setPosts] = React.useState<BlogPostContent[]>(p.posts)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let ignore = false
    setLoading(true)

    fetchPublishedBlogPosts(locale).then((next) => {
      if (!ignore) {
        setPosts(next)
        setLoading(false)
      }
    })

    return () => {
      ignore = true
    }
  }, [locale])

  return (
    <div className={cn("min-h-screen bg-white", playfair.variable)}>
      <section className="relative flex min-h-[72vh] w-full items-center justify-center overflow-hidden pt-20 md:pt-0">
        <div className="absolute inset-0 z-0">
          <img
            src={p.heroBackground}
            alt={p.heroAlt}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 py-20 text-center md:py-28 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <h1
              className={cn(
                playfair.className,
                "text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-7xl",
              )}
            >
              {p.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-white/92 md:text-lg">
              {p.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

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

        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-14">
            {posts.map((post, idx) => (
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
        )}
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
