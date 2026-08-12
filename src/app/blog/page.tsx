"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Playfair_Display } from "next/font/google"
import { motion } from "framer-motion"
import { ChevronRight, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"
import { BlogSidebar } from "@/components/blog/BlogSidebar"
import { useLanguage } from "@/contexts/LanguageContext"
import { getSiteCopy } from "@/i18n/siteCopy"
import { cn } from "@/lib/utils"
import {
  fetchBlogCategoriesWithCounts,
  fetchPublishedBlogPosts,
  type BlogCategoryWithCount,
  type BlogPostContent,
} from "@/lib/blog"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-blog",
  display: "swap",
})

const sectionFade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
}

function buildBlogHref(pathname: string, search: string, category: string) {
  const params = new URLSearchParams()
  if (search.trim()) params.set("search", search.trim())
  if (category.trim()) params.set("category", category.trim())
  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

function BlogPageContent() {
  const { locale } = useLanguage()
  const copy = getSiteCopy(locale)
  const p = copy.pages.blog
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get("search")?.trim() ?? ""
  const category = searchParams.get("category")?.trim() ?? ""
  const hasFilters = Boolean(search || category)

  const [posts, setPosts] = React.useState<BlogPostContent[]>([])
  const [categories, setCategories] = React.useState<BlogCategoryWithCount[]>([])
  const [totalPosts, setTotalPosts] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  const updateFilters = React.useCallback(
    (next: { search?: string; category?: string | null }) => {
      const nextSearch = next.search !== undefined ? next.search : search
      const nextCategory =
        next.category === null ? "" : next.category !== undefined ? next.category : category
      router.push(buildBlogHref(pathname, nextSearch, nextCategory), { scroll: false })
    },
    [router, pathname, search, category],
  )

  React.useEffect(() => {
    let ignore = false
    setLoading(true)

    Promise.all([
      fetchPublishedBlogPosts(locale, { search, category }),
      fetchBlogCategoriesWithCounts(locale),
    ]).then(([nextPosts, nextCategories]) => {
      if (ignore) return
      setPosts(nextPosts)
      setCategories(nextCategories)
      setTotalPosts(nextCategories.reduce((sum, c) => sum + c.count, 0))
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [locale, search, category])

  const sidebarCopy = {
    searchPlaceholder: p.searchPlaceholder,
    searchSubmit: p.searchSubmit,
    clearSearch: p.clearSearch,
    categoriesTitle: p.categoriesTitle,
    allPosts: p.allPosts,
    postsCount: p.postsCount,
  }

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
        <motion.div
          {...sectionFade}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
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
            {hasFilters ? (
              <p className="mt-2 text-sm text-slate-500">{p.postsCount(posts.length)}</p>
            ) : null}
          </div>
          {hasFilters ? (
            <Button
              variant="outline"
              className="shrink-0 rounded-full border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => updateFilters({ search: "", category: null })}
            >
              {p.resetFilters}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="shrink-0 rounded-full border-primary/40 text-primary hover:bg-primary/5"
              asChild
            >
              <Link href="/blog">{p.viewAll}</Link>
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {loading && posts.length === 0 ? (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
                <SearchX className="mb-4 h-10 w-10 text-slate-300" />
                <p className="max-w-md text-base text-slate-600">{p.emptyResults}</p>
                <Button
                  className="mt-6 rounded-full"
                  onClick={() => updateFilters({ search: "", category: null })}
                >
                  {p.resetFilters}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-12">
                {posts.map((post, idx) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: idx * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/80"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden"
                    >
                      <img
                        src={post.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-6 md:p-8">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {post.categorySlug ? (
                          <button
                            type="button"
                            onClick={() => updateFilters({ category: post.categorySlug })}
                            className="hover:text-primary"
                          >
                            {post.category}
                          </button>
                        ) : (
                          <span>{post.category}</span>
                        )}
                        <span className="text-slate-300">·</span>
                        <time dateTime={post.date}>{post.date}</time>
                      </div>
                      <h3
                        className={cn(
                          playfair.className,
                          "text-xl font-semibold text-primary md:text-2xl lg:text-[1.35rem]",
                        )}
                      >
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition-colors hover:text-primary/85"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 md:text-base">
                        {post.excerpt}
                      </p>
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
          </div>

          <BlogSidebar
            className="lg:sticky lg:top-28"
            search={search}
            category={category}
            categories={categories}
            totalPosts={totalPosts}
            copy={sidebarCopy}
            onSearchSubmit={(value) => updateFilters({ search: value })}
            onClearSearch={() => updateFilters({ search: "" })}
            onSelectCategory={(slug) => updateFilters({ category: slug })}
            onResetAll={() => updateFilters({ search: "", category: null })}
          />
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

export default function BlogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
          Cargando blog…
        </div>
      }
    >
      <BlogPageContent />
    </React.Suspense>
  )
}
