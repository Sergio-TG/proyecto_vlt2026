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
import { resolveBlogCategorySlug } from "@/lib/blog-categories"
import { BlogRichText } from "@/lib/blog-rich-text"
import { BlogAudioPlayer } from "@/components/blog/BlogAudioPlayer"
import { BlogMediaGallery } from "@/components/blog/BlogMediaGallery"
import { resolveBlogImageUrl } from "@/lib/imagekit.config"

const playfair = Playfair_Display({
  subsets: ["latin"],
})

export default function BlogArticlePage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? ""
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.blog
  const [post, setPost] = React.useState<BlogPostContent | null>(() => {
    const found = p.posts.find((item) => item.slug === slug)
    if (!found) return null
    return {
      ...found,
      categorySlug: resolveBlogCategorySlug(found.category) ?? "",
    }
  })
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
        <div className="container mx-auto max-w-4xl animate-pulse space-y-4 px-4">
          <div className="h-8 w-40 rounded bg-slate-100" />
          <div className="h-12 w-full rounded bg-slate-100" />
          <div className="h-[220px] w-full rounded-2xl bg-slate-100 md:h-[380px]" />
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
      className="min-h-screen bg-white pb-20 pt-24 md:pt-28"
    >
      {/* Columna de lectura: categoría → título → portada → audio → cuerpo */}
      <div className="container mx-auto max-w-4xl px-4">
        <Button
          variant="ghost"
          className="group -ml-2 gap-2 rounded-full text-slate-600 hover:text-primary"
          asChild
        >
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {p.backToBlog}
          </Link>
        </Button>

        {/* 1. Categoría + fecha */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          {post.categorySlug ? (
            <Link
              href={`/blog?category=${encodeURIComponent(post.categorySlug)}`}
              className="hover:text-primary"
            >
              {post.category}
            </Link>
          ) : (
            <span>{post.category}</span>
          )}
          <span className="text-slate-300">·</span>
          <time dateTime={post.date}>{post.date}</time>
        </div>

        {/* 2. Título + copete */}
        <h1
          className={cn(
            playfair.className,
            "mt-3 text-3xl font-semibold leading-tight text-primary md:text-4xl lg:text-[2.75rem]",
          )}
        >
          {post.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base font-light leading-relaxed text-slate-600 md:text-lg">
          {post.excerpt}
        </p>

        {/* 3. Portada: alto acotado en desktop (~380px), 16/9 en móvil */}
        {post.image ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-md shadow-slate-200/40"
          >
            <div className="relative aspect-[16/9] w-full md:aspect-auto md:h-[380px] md:max-h-[380px]">
              <img
                src={resolveBlogImageUrl(post.image, "blogCover")}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
                decoding="async"
              />
            </div>
          </motion.div>
        ) : null}

        {/* 4. Player de audio */}
        {post.audioUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mt-6"
          >
            <BlogAudioPlayer src={post.audioUrl} title={post.audioTitle} />
          </motion.div>
        ) : null}

        {/* 5. Cuerpo del artículo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto max-w-3xl space-y-6 py-10 md:py-12"
        >
          {post.paragraphs?.map((paragraph, i) => (
            <p
              key={i}
              className="mb-6 text-base leading-relaxed text-slate-600 last:mb-0 md:text-lg"
            >
              <BlogRichText text={paragraph} />
            </p>
          ))}
        </motion.div>

        {/* Galería multimedia */}
        {post.gallery && post.gallery.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="pb-10"
          >
            <BlogMediaGallery items={post.gallery} alt={post.title} />
          </motion.div>
        ) : null}

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl border-t border-slate-100 pb-4 pt-6"
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
