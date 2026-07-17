"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Playfair_Display } from "next/font/google"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { cn } from "@/lib/utils"
import { fetchPublishedBlogPostBySlug, type BlogPostContent } from "@/lib/blog"
import { BlogRichText } from "@/lib/blog-rich-text"

const playfair = Playfair_Display({
  subsets: ["latin"],
})

export default function BlogArticlePage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? ""
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.blog
  const [post, setPost] = React.useState<BlogPostContent | null>(
    () => p.posts.find((item) => item.slug === slug) ?? null,
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let ignore = false
    setLoading(true)

    fetchPublishedBlogPostBySlug(slug, locale).then((next) => {
      if (!ignore) {
        setPost(next)
        setLoading(false)
      }
    })

    return () => {
      ignore = true
    }
  }, [slug, locale])

  if (loading && !post) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-24">
        <div className="container mx-auto max-w-3xl animate-pulse space-y-4 px-4">
          <div className="h-8 w-40 rounded bg-slate-100" />
          <div className="h-12 w-full rounded bg-slate-100" />
          <div className="h-64 w-full rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600">{p.notFound}</p>
          <Button className="mt-6 rounded-full" asChild>
            <Link href="/blog">{p.backToBlog}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-white pb-20"
    >
      <div className="border-b border-slate-100 pt-24 md:pt-28">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <Button variant="ghost" className="group -ml-2 gap-2 rounded-full text-slate-600 hover:text-primary" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {p.backToBlog}
            </Link>
          </Button>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <span>{post.category}</span>
            <span className="text-slate-300">·</span>
            <time dateTime={post.date}>{post.date}</time>
          </div>

          <h1 className={cn(playfair.className, "mt-4 max-w-3xl text-3xl font-semibold text-primary md:text-5xl")}>
            {post.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-600">{post.excerpt}</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="-mt-2 overflow-hidden rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 md:-mt-4"
        >
          <img src={post.image} alt="" className="aspect-[21/9] w-full object-cover md:aspect-[3/1]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="mx-auto max-w-2xl space-y-6 py-12 md:py-16"
        >
          {post.paragraphs?.map((paragraph, i) => (
            <p key={i} className="mb-6 text-base leading-relaxed text-slate-600 last:mb-0 md:text-lg">
              <BlogRichText text={paragraph} />
            </p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl border-t border-slate-100 pb-4 pt-4 md:pt-6"
        >
          <div className="rounded-[2rem] bg-gradient-to-b from-slate-50 to-white px-6 py-10 text-center md:px-10 md:py-12">
            <h2
              className={cn(
                playfair.className,
                "text-2xl font-semibold tracking-tight text-primary md:text-3xl",
              )}
            >
              {p.articleCtaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-slate-600 md:text-lg">
              {p.articleCtaSubtitle}
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="h-14 gap-2 rounded-full px-10 text-base font-bold shadow-2xl transition-all hover:shadow-primary/20 md:h-16 md:px-12 md:text-lg"
                asChild
              >
                <Link href="/alojamientos">
                  {p.articleCta}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.article>
  )
}
