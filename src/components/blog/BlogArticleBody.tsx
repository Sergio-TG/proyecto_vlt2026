import { BlogRichText } from "@/lib/blog-rich-text"
import { joinBlogParagraphsHtml, sanitizeBlogHtml } from "@/lib/blog-html"
import { cn } from "@/lib/utils"

const PROSE_CLASS =
  "blog-prose prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-primary prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl prose-h4:text-lg md:prose-h4:text-xl prose-p:text-base prose-p:leading-relaxed prose-p:text-slate-600 md:prose-p:text-lg prose-a:font-semibold prose-a:text-primary prose-blockquote:border-primary/40 prose-blockquote:text-slate-600 prose-li:text-slate-600 prose-img:rounded-xl prose-img:shadow-md prose-hr:border-slate-200 prose-pre:bg-slate-900 prose-pre:text-slate-100"

export function BlogArticleBody({ paragraphs }: { paragraphs: string[] }) {
  const html = joinBlogParagraphsHtml(paragraphs)

  if (html) {
    return (
      <div
        className={cn(PROSE_CLASS)}
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className="mb-6 text-base leading-relaxed text-slate-600 last:mb-0 md:text-lg"
        >
          <BlogRichText text={paragraph} />
        </p>
      ))}
    </div>
  )
}
