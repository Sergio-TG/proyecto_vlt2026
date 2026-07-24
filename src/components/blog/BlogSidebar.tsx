"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BlogCategoryWithCount } from "@/lib/blog"

export type BlogSidebarCopy = {
  searchPlaceholder: string
  searchSubmit: string
  clearSearch: string
  categoriesTitle: string
  allPosts: string
  postsCount: (n: number) => string
}

type BlogSidebarProps = {
  search: string
  category: string
  categories: BlogCategoryWithCount[]
  totalPosts: number
  copy: BlogSidebarCopy
  onSearchSubmit: (value: string) => void
  onClearSearch: () => void
  onSelectCategory: (slug: string | null) => void
  onResetAll: () => void
  className?: string
}

export function BlogSidebar({
  search,
  category,
  categories,
  totalPosts,
  copy,
  onSearchSubmit,
  onClearSearch,
  onSelectCategory,
  onResetAll,
  className,
}: BlogSidebarProps) {
  const [draft, setDraft] = React.useState(search)

  React.useEffect(() => {
    setDraft(search)
  }, [search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchSubmit(draft.trim())
  }

  return (
    <aside className={cn("space-y-8", className)}>
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="blog-search" className="sr-only">
            {copy.searchPlaceholder}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="blog-search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="h-11 rounded-full border-slate-200 bg-white pl-10 pr-10"
            />
            {draft ? (
              <button
                type="button"
                onClick={() => {
                  setDraft("")
                  onClearSearch()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
                aria-label={copy.clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Button type="submit" className="h-10 w-full rounded-full">
            {copy.searchSubmit}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          {copy.categoriesTitle}
        </h3>
        <ul className="mt-4 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => {
                setDraft("")
                onResetAll()
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                !category && !search
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <span>{copy.allPosts}</span>
              <span className="tabular-nums text-xs text-slate-400">({totalPosts})</span>
            </button>
          </li>
          {categories.map((cat) => {
            const active = category === cat.slug
            return (
              <li key={cat.slug}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.slug)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span className="min-w-0 leading-snug">{cat.name}</span>
                  <span className="shrink-0 tabular-nums text-xs text-slate-400">({cat.count})</span>
                </button>
              </li>
            )
          })}
        </ul>

        {(search || category) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setDraft("")
                onResetAll()
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              {copy.allPosts}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
