/**
 * Genera textos_revision.txt con títulos, subtítulos y textos de la web (solo español).
 * Uso: npm run export-textos
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getSiteCopy } from "../src/i18n/siteCopy"
import type { SiteLocale } from "../src/contexts/LanguageContext"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outFile = path.join(root, "textos_revision.txt")

const PAGE_FILES = ["page.tsx", "index.tsx"] as const

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

function textLooksLikeUrl(s: string): boolean {
  return /^(\/|https?:\/\/|mailto:|tel:)/.test(s.trim())
}

function flattenCopy(obj: unknown, pathParts: string[], lines: string[]): void {
  if (typeof obj === "string") {
    const lastKey = pathParts[pathParts.length - 1] ?? ""
    if (lastKey === "href" || textLooksLikeUrl(obj)) return
    const text = stripHtml(obj)
    if (!text) return
    const label = pathParts.join(" › ")
    lines.push(label ? `${label}: ${text}` : text)
    return
  }
  if (typeof obj === "function") return
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenCopy(item, [...pathParts, `[${i + 1}]`], lines))
    return
  }
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      flattenCopy(value, [...pathParts, key], lines)
    }
  }
}

/** Texto visible en JSX (líneas sueltas entre tags, sin código). */
function extractInlineFromTsx(content: string): string[] {
  const found: string[] = []
  const skip =
    /^\s*(import|export|const|let|var|function|return|if|else|className|style|type|interface|\/\/|\/\*|\*|\{|\}|<\/?[A-Z]|<\/?div|<\/?section|<\/?span|<\/?Button|<\/?Link|<\/?motion)/

  for (const line of content.split("\n")) {
    const t = line.trim()
    if (!t || skip.test(t)) continue
    if (/^[\w.]+\(/.test(t)) continue
    if (/^["'`{}\[\],;]+$/.test(t)) continue

    const jsxText = t.match(/^>([^<]+)</)?.[1]?.trim()
    if (jsxText && jsxText.length > 2 && !jsxText.startsWith("{")) {
      found.push(jsxText)
      continue
    }

    const quoted = [...t.matchAll(/["']([^"'\\]{4,})["']/g)]
      .map((m) => m[1])
      .filter(
        (s) =>
          !s.startsWith("/") &&
          !s.startsWith("@") &&
          !s.includes("className") &&
          !/^[a-z-]+$/.test(s) &&
          /[áéíóúñÁÉÍÓÚÑ\s]|[A-Z]{2,}/.test(s),
      )
    found.push(...quoted)
  }

  return [...new Set(found)]
}

function collectPageFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue
      results.push(...collectPageFiles(full))
    } else if (PAGE_FILES.includes(entry.name as (typeof PAGE_FILES)[number])) {
      results.push(full)
    }
  }
  return results.sort()
}

function section(title: string): string {
  return `\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}\n`
}

function exportLocale(locale: SiteLocale): string {
  const copy = getSiteCopy(locale)
  let out = section("CONTENIDO DE LA WEB (español)")

  const blocks: { name: string; data: unknown }[] = [
    { name: "Navegación y cabecera", data: { nav: copy.nav, header: copy.header } },
    { name: "Inicio (hero, secciones)", data: {
      hero: copy.hero,
      trustBuilders: copy.trustBuilders,
      termasTeaser: copy.termasTeaser,
      featuredAccommodations: copy.featuredAccommodations,
      narrative: copy.narrative,
      socialProof: copy.socialProof,
      newsletter: copy.newsletter,
    }},
    { name: "Footer y tarjetas", data: { footer: copy.footer, accommodationCard: copy.accommodationCard } },
    { name: "Páginas", data: copy.pages },
  ]

  for (const block of blocks) {
    const lines: string[] = []
    flattenCopy(block.data, [], lines)
    out += `\n--- ${block.name} ---\n`
    out += lines.join("\n") + "\n"
  }

  return out
}

function exportInlinePages(): string {
  let out = section("TEXTOS HARDCODEADOS en page.tsx / index.tsx (no están en i18n)")
  const appDir = path.join(root, "src", "app")
  const files = collectPageFiles(appDir)

  for (const file of files) {
    const rel = path.relative(root, file)
    const content = fs.readFileSync(file, "utf8")
    const lines = extractInlineFromTsx(content)
    if (lines.length === 0) continue
    out += `\n--- ${rel} ---\n`
    out += lines.map((l) => `• ${l}`).join("\n") + "\n"
  }

  return out
}

function main(): void {
  const header = [
    "TEXTOS DE REVISIÓN — Viví las Termas",
    `Generado: ${new Date().toLocaleString("es-AR")}`,
    "",
    "Idioma: español. Textos desde siteCopy.ts y pagesCopy.ts.",
    "Podés abrirlo en Word/Google Docs y exportar a PDF.",
    "",
    "Regenerar: npm run export-textos",
  ].join("\n")

  const body = header + exportLocale("es") + exportInlinePages()

  fs.writeFileSync(outFile, body, "utf8")
  console.log(`✓ Archivo generado: ${outFile}`)
  console.log(`  Tamaño: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`)
}

main()
