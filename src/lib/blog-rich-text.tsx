import * as React from "react"

/**
 * Formato liviano para párrafos del blog (markdown inline):
 * **negrita**  *cursiva*  ~~tachado~~  ++subrayado++  [texto](https://...)
 */

type Token =
  | { type: "text"; value: string }
  | { type: "bold" | "italic" | "strike" | "underline"; children: Token[] }
  | { type: "link"; href: string; children: Token[] }

const INLINE_RE =
  /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\+\+[^+]+\+\+|\[[^\]]+\]\([^)]+\))/g

function parseInline(input: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  const matches = input.matchAll(INLINE_RE)

  for (const match of matches) {
    const index = match.index ?? 0
    if (index > last) {
      tokens.push({ type: "text", value: input.slice(last, index) })
    }

    const raw = match[0]

    if (raw.startsWith("**") && raw.endsWith("**")) {
      tokens.push({ type: "bold", children: parseInline(raw.slice(2, -2)) })
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      tokens.push({ type: "italic", children: parseInline(raw.slice(1, -1)) })
    } else if (raw.startsWith("~~") && raw.endsWith("~~")) {
      tokens.push({ type: "strike", children: parseInline(raw.slice(2, -2)) })
    } else if (raw.startsWith("++") && raw.endsWith("++")) {
      tokens.push({ type: "underline", children: parseInline(raw.slice(2, -2)) })
    } else if (raw.startsWith("[")) {
      const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const href = sanitizeHref(linkMatch[2])
        if (href) {
          tokens.push({
            type: "link",
            href,
            children: parseInline(linkMatch[1]),
          })
        } else {
          tokens.push({ type: "text", value: raw })
        }
      }
    }

    last = index + raw.length
  }

  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) })
  }

  return tokens.length > 0 ? tokens : [{ type: "text", value: input }]
}

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return null
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#")
  ) {
    return trimmed
  }
  return null
}

function renderTokens(tokens: Token[], keyPrefix: string): React.ReactNode[] {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`
    if (token.type === "text") return <React.Fragment key={key}>{token.value}</React.Fragment>
    if (token.type === "bold") return <strong key={key}>{renderTokens(token.children, key)}</strong>
    if (token.type === "italic") return <em key={key}>{renderTokens(token.children, key)}</em>
    if (token.type === "strike") return <s key={key}>{renderTokens(token.children, key)}</s>
    if (token.type === "underline") return <u key={key}>{renderTokens(token.children, key)}</u>
    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          className="font-semibold text-primary underline-offset-2 hover:underline"
          target={token.href.startsWith("http") ? "_blank" : undefined}
          rel={token.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {renderTokens(token.children, key)}
        </a>
      )
    }
    return null
  })
}

export function BlogRichText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const nodes = React.useMemo(() => renderTokens(parseInline(text), "rt"), [text])
  return <span className={className}>{nodes}</span>
}

export type RichWrapKind = "bold" | "italic" | "underline" | "strike" | "link"

export function wrapRichSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  kind: RichWrapKind,
): { next: string; cursorStart: number; cursorEnd: number } {
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)
  const selected = value.slice(start, end)
  const placeholder =
    kind === "link" ? "texto del enlace" : kind === "bold" ? "negrita" : kind === "italic" ? "cursiva" : kind === "underline" ? "subrayado" : "tachado"
  const inner = selected || placeholder

  let wrapped = ""
  if (kind === "bold") wrapped = `**${inner}**`
  else if (kind === "italic") wrapped = `*${inner}*`
  else if (kind === "underline") wrapped = `++${inner}++`
  else if (kind === "strike") wrapped = `~~${inner}~~`
  else {
    const href = selected.startsWith("http") ? selected : "https://"
    const label = selected.startsWith("http") ? "enlace" : inner
    wrapped = `[${label}](${href})`
  }

  const next = value.slice(0, start) + wrapped + value.slice(end)
  const cursorStart = start + (kind === "link" ? 1 : kind === "italic" ? 1 : 2)
  const cursorEnd = cursorStart + (kind === "link" ? labelLength(wrapped) : inner.length)

  return { next, cursorStart, cursorEnd }
}

function labelLength(wrappedLink: string): number {
  const m = wrappedLink.match(/^\[([^\]]*)\]/)
  return m ? m[1].length : 0
}
