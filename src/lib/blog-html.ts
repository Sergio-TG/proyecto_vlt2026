/**
 * HTML del cuerpo del blog: detección, parseo para Supabase (`paragraphs_es` /
 * `paragraphs_en`), carga en TipTap y sanitizado para la vista pública.
 */

const HTML_TAG_RE =
  /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|hr|img|div|span|strong|b|em|i|u|s|br|a|mark|code|figure|figcaption)\b/i

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "pre",
  "code",
  "img",
  "span",
  "mark",
])

const VOID_TAGS = new Set(["br", "hr", "img"])

const GLOBAL_ATTRS = new Set(["class", "style"])

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "class", "style"]),
  img: new Set(["src", "alt", "title", "class", "width", "height"]),
  span: new Set(["style", "class", "data-color"]),
  mark: new Set(["style", "class", "data-color"]),
  p: new Set(["style", "class"]),
  h2: new Set(["style", "class"]),
  h3: new Set(["style", "class"]),
  h4: new Set(["style", "class"]),
  blockquote: new Set(["style", "class"]),
  pre: new Set(["class"]),
  code: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  li: new Set(["class", "style"]),
}

const ALLOWED_STYLE_PROPS = new Set(["color", "background-color", "text-align"])

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value)
}

export function isEmptyBlogHtml(html: string): boolean {
  const withKeep = html
    .replace(/<img\b[^>]*>/gi, "IMG")
    .replace(/<hr\b[^>]*>/gi, "HR")
  const text = withKeep
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, "")
  return text.length === 0
}

export function sanitizeHref(href: string): string | null {
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inlineMarkdownToHtml(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  html = html.replace(/~~([^~]+)~~/g, "<s>$1</s>")
  html = html.replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>")
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    const safe = sanitizeHref(href.replace(/&amp;/g, "&"))
    return safe ? `<a href="${escapeHtml(safe)}">${label}</a>` : label
  })
  return html.replace(/\n/g, "<br>")
}

/** Convierte el array de Supabase al HTML que carga TipTap (legacy markdown → HTML). */
export function paragraphsToEditorHtml(paragraphs: string[]): string {
  if (!paragraphs.length) return ""
  if (paragraphs.some(looksLikeHtml)) {
    return paragraphs.join("")
  }
  return paragraphs.map((paragraph) => `<p>${inlineMarkdownToHtml(paragraph)}</p>`).join("")
}

/**
 * Normaliza el payload del admin a `string[]` para `paragraphs_es` / `paragraphs_en`.
 * El HTML de TipTap se guarda como un único elemento para no partir tags.
 */
export function parseBlogParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => String(item ?? "").replace(/\r\n/g, "\n").trim())
      .filter(Boolean)
    if (items.some(looksLikeHtml)) {
      const html = items.join("")
      return isEmptyBlogHtml(html) ? [] : [html]
    }
    return items
  }

  if (typeof value === "string") {
    const normalized = value.replace(/\r\n/g, "\n")
    if (looksLikeHtml(normalized)) {
      const trimmed = normalized.trim()
      return isEmptyBlogHtml(trimmed) ? [] : [trimmed]
    }
    return normalized
      .split(/\n\s*\n/)
      .map((block) => block.replace(/^\n+|\n+$/g, "").trim())
      .filter(Boolean)
  }

  return []
}

export function joinBlogParagraphsHtml(paragraphs: string[]): string | null {
  if (!paragraphs.length) return null
  if (!paragraphs.some(looksLikeHtml)) return null
  const html = paragraphs.join("")
  return isEmptyBlogHtml(html) ? null : html
}

function sanitizeStyle(value: string): string {
  return value
    .split(";")
    .map((part) => {
      const colon = part.indexOf(":")
      if (colon < 0) return null
      const name = part.slice(0, colon).trim().toLowerCase()
      const raw = part.slice(colon + 1).trim()
      if (!ALLOWED_STYLE_PROPS.has(name) || !raw) return null
      if (/expression|url\s*\(|javascript/i.test(raw)) return null
      return `${name}: ${raw}`
    })
    .filter(Boolean)
    .join("; ")
}

function sanitizeClass(value: string): string {
  return value
    .split(/\s+/)
    .filter((token) => /^[a-zA-Z0-9_-]+$/.test(token))
    .join(" ")
}

function decodeAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function sanitizeAttrs(tag: string, rawAttrs: string): string {
  const allowed = TAG_ATTRS[tag] ?? GLOBAL_ATTRS
  const out: string[] = []
  const re = /([a-zA-Z_:][a-zA-Z0-9:._-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let match: RegExpExecArray | null
  while ((match = re.exec(rawAttrs))) {
    const name = match[1].toLowerCase()
    if (name.startsWith("on")) continue
    if (!allowed.has(name)) continue
    const value = decodeAttr(match[2] ?? match[3] ?? match[4] ?? "")

    if (name === "href") {
      const href = sanitizeHref(value)
      if (!href) continue
      out.push(`href="${escapeHtml(href)}"`)
      continue
    }
    if (name === "src") {
      const src = sanitizeHref(value)
      if (!src || src.startsWith("mailto:") || src.startsWith("tel:")) continue
      out.push(`src="${escapeHtml(src)}"`)
      continue
    }
    if (name === "style") {
      const style = sanitizeStyle(value)
      if (!style) continue
      out.push(`style="${escapeHtml(style)}"`)
      continue
    }
    if (name === "class") {
      const cls = sanitizeClass(value)
      if (!cls) continue
      out.push(`class="${escapeHtml(cls)}"`)
      continue
    }
    if (name === "target") {
      if (value !== "_blank" && value !== "_self") continue
      out.push(`target="${escapeHtml(value)}"`)
      continue
    }
    if (name === "rel") {
      out.push(`rel="${escapeHtml(value.replace(/[^\w\s-]/g, ""))}"`)
      continue
    }
    if (name === "data-color") {
      if (!/^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]+$/.test(value.trim())) continue
      out.push(`data-color="${escapeHtml(value.trim())}"`)
      continue
    }
    if (name === "alt" || name === "title") {
      out.push(`${name}="${escapeHtml(value)}"`)
      continue
    }
    if ((name === "width" || name === "height") && /^\d+$/.test(value)) {
      out.push(`${name}="${value}"`)
    }
  }

  if (tag === "a" && out.some((attr) => attr.startsWith("target=\"_blank\"")) && !out.some((attr) => attr.startsWith("rel="))) {
    out.push('rel="noopener noreferrer"')
  }

  return out.length ? ` ${out.join(" ")}` : ""
}

/** Sanitizado determinista (servidor y cliente) para `dangerouslySetInnerHTML`. */
export function sanitizeBlogHtml(unsafe: string): string {
  if (!unsafe) return ""
  return unsafe
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, tagName: string, attrs = "") => {
      const tag = tagName.toLowerCase()
      const closing = full.startsWith("</")
      if (!ALLOWED_TAGS.has(tag)) return ""
      if (closing) return VOID_TAGS.has(tag) ? "" : `</${tag}>`
      const safeAttrs = sanitizeAttrs(tag, attrs)
      if (VOID_TAGS.has(tag)) return `<${tag}${safeAttrs}>`
      return `<${tag}${safeAttrs}>`
    })
}
