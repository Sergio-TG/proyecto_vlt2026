import type {
  BedTypeKey,
  CancelacionPolicy,
  CancelacionPoliticaKey,
  DistribucionCamaItem,
} from "./supabase-queries"

export type AccommodationLocale = "es" | "en"
export type StayInfoField = "beds" | "cancellation" | "auto"

export type { BedTypeKey, CancelacionPolicy, CancelacionPoliticaKey, DistribucionCamaItem }

export const BED_TYPE_KEYS: BedTypeKey[] = [
  "sommier_matrimonial",
  "sommier_king",
  "cama_matrimonial",
  "sommier_twin",
  "cama_individual",
  "cama_carrito_marinera",
  "cucheta_litera",
  "sofa_cama",
  "futon",
]

export const BED_TYPE_FORM_OPTIONS: Array<{ key: BedTypeKey; label: string }> = [
  { key: "sommier_matrimonial", label: "Sommier Matrimonial / Doble" },
  { key: "sommier_king", label: "Sommier King / Extra Grande" },
  { key: "cama_matrimonial", label: "Cama Matrimonial Común" },
  { key: "sommier_twin", label: "Sommier Individual / Twin con cama carrito" },
  { key: "cama_individual", label: "Cama Individual / 1 Plaza Común" },
  { key: "cama_carrito_marinera", label: "Cama Carrito / Marinera" },
  { key: "cucheta_litera", label: "Cucheta / Litera" },
  { key: "sofa_cama", label: "Sofá Cama" },
  { key: "futon", label: "Futón" },
]

export const CANCELLATION_POLICY_FORM_OPTIONS: Array<{ key: CancelacionPoliticaKey; label: string }> = [
  { key: "no_reembolso", label: "No hay reembolso" },
  { key: "a_convenir", label: "A convenir" },
  { key: "reembolso_72h", label: "Reembolso 72 horas antes" },
  { key: "reembolso_dias_x", label: "Cantidad de días antes (reembolso)" },
  { key: "cobra_primera_noche", label: "El huésped pagará la primera noche si cancela..." },
  { key: "cobra_total_estadia", label: "El huésped pagará el total de la estadía si cancela..." },
  { key: "consultar_whatsapp", label: "Consultar por WhatsApp" },
  { key: "consultar_politicas", label: "Consultar políticas de cancelación" },
  { key: "sujeto_disponibilidad", label: "Sujeto a disponibilidad" },
]

type BedLabelPair = { singular: string; plural: string }

const BED_TYPE_LABELS_ES: Record<BedTypeKey, BedLabelPair> = {
  sommier_matrimonial: { singular: "Sommier Matrimonial / Doble", plural: "Sommiers Matrimoniales / Dobles" },
  sommier_king: { singular: "Sommier King / Extra Grande", plural: "Sommiers King / Extra Grandes" },
  cama_matrimonial: { singular: "Cama Matrimonial Común", plural: "Camas Matrimoniales Comunes" },
  sommier_twin: { singular: "Sommier Individual / Twin", plural: "Sommiers Individuales / Twin" },
  cama_individual: { singular: "Cama Individual / 1 Plaza Común", plural: "Camas Individuales / 1 Plaza Comunes" },
  cama_carrito_marinera: { singular: "Cama Carrito / Marinera", plural: "Camas Carrito / Marineras" },
  cucheta_litera: { singular: "Cucheta / Litera", plural: "Cuchetas / Literas" },
  sofa_cama: { singular: "Sofá Cama", plural: "Sofás Cama" },
  futon: { singular: "Futón", plural: "Futones" },
}

const BED_TYPE_LABELS_EN: Record<BedTypeKey, BedLabelPair> = {
  sommier_matrimonial: { singular: "Double Sommier", plural: "Double Sommiers" },
  sommier_king: { singular: "King Bed", plural: "King Beds" },
  cama_matrimonial: { singular: "Standard Double Bed", plural: "Standard Double Beds" },
  sommier_twin: { singular: "Twin Sommier", plural: "Twin Sommiers" },
  cama_individual: { singular: "Standard Single Bed", plural: "Standard Single Beds" },
  cama_carrito_marinera: { singular: "Trundle Bed", plural: "Trundle Beds" },
  cucheta_litera: { singular: "Bunk Bed", plural: "Bunk Beds" },
  sofa_cama: { singular: "Sofa Bed", plural: "Sofa Beds" },
  futon: { singular: "Futon", plural: "Futons" },
}

const CANCELLATION_LABELS_ES: Record<CancelacionPoliticaKey, string> = {
  no_reembolso: "No hay reembolso",
  a_convenir: "A convenir",
  reembolso_72h: "Reembolso 72 horas antes",
  reembolso_dias_x: "{dias} días antes de la llegada",
  cobra_primera_noche: "El huésped pagará la primera noche si cancela...",
  cobra_total_estadia: "El huésped pagará el total de la estadía si cancela...",
  consultar_whatsapp: "Consultar por WhatsApp",
  consultar_politicas: "Consultar políticas de cancelación",
  sujeto_disponibilidad: "Sujeto a disponibilidad",
}

const CANCELLATION_LABELS_EN: Record<CancelacionPoliticaKey, string> = {
  no_reembolso: "Non-refundable Policy",
  a_convenir: "To be agreed",
  reembolso_72h: "Cancel up to 72 hours before check-in for a full refund",
  reembolso_dias_x: "{dias} days before arrival",
  cobra_primera_noche: "The guest will be charged the first night if they cancel...",
  cobra_total_estadia: "The guest will be charged the total price of the reservation if they cancel...",
  consultar_whatsapp: "Inquire via WhatsApp",
  consultar_politicas: "Inquire about our cancellation policy",
  sujeto_disponibilidad: "Subject to availability",
}

const VALID_BED_KEYS = new Set<string>(BED_TYPE_KEYS)
const VALID_POLICY_KEYS = new Set<string>(CANCELLATION_POLICY_FORM_OPTIONS.map((o) => o.key))

const LEGACY_POLICY_KEY_ALIASES: Record<string, CancelacionPoliticaKey> = {
  no_reembolsable: "no_reembolso",
  reembolso_preaviso: "reembolso_dias_x",
}

function normalizeLegacyKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** Frases legacy exactas (normalizadas) → inglés. */
const LEGACY_BED_EXACT_EN: Record<string, string> = {
  "matrimoniales individuales cuchetas": "Double, Single, and Bunk Beds",
  "sommier de 2 plazas en el dormitorio y en el comedor hay un un sofa bed con marinera":
    "Double sommier in the bedroom and a sofa bed with a trundle bed in the living area",
  "1 sommier matrimonial, 1 sommier twin con cama carrito": "1 double bed, 1 twin bed with a trundle bed",
  "cama matrimonio, camas individuales": "1 double bed, Single beds.",
  "1 cama doble extragrande": "1 King Bed",
}

const LEGACY_CABANA_BED_ES =
  "En una cabaña una cama matrimonial y una cama marinera donde duermen 2. En la otra cabaña, cama matrimonial, otra habitación con dos camas individuales y comer con marinera, donde duermen 2 más."

LEGACY_BED_EXACT_EN[normalizeLegacyKey(LEGACY_CABANA_BED_ES)] = `Cabin 1: 1 double bed, 1 trundle bed
Cabin 2:
Bedroom 1: 1 double bed
Bedroom 2: 2 single beds
Living room: 1 sofa bed with a trundle bed`

const LEGACY_CANCEL_EXACT_EN: Record<string, string> = {
  "a convenir": "To be agreed",
  "consultar por whatsapp": "Inquire via WhatsApp",
  "no reembolsable": "Non-refundable Policy",
  "no hay reembolso": "Non-refundable Policy",
  "consultar politicas de cancelacion": "Inquire about our cancellation policy",
  "sujeto a disponibilidad": "Subject to availability",
}

const BED_PHRASE_TO_EN: Array<[RegExp, string]> = [
  [/y\s+en\s+el\s+comedor\s+hay\s+un(?:a)?/gi, "and in the living area there is a"],
  [/en\s+el\s+dormitorio\s+y\s+en\s+el\s+comedor/gi, "in the bedroom and in the living area"],
  [/en\s+el\s+dormitorio/gi, "in the bedroom"],
  [/en\s+el\s+comedor/gi, "in the living area"],
  [/sommier(?:es)?\s+de\s+2\s+plazas/gi, "double sommier"],
  [/cama\s+doble\s+extragrande/gi, "king-size bed"],
  [/camas\s+dobles\s+extragrandes/gi, "king-size beds"],
  [/cama\s+matrimonial/gi, "double bed"],
  [/camas\s+matrimoniales/gi, "double beds"],
  [/cama\s+matrimonio/gi, "double bed"],
  [/cama\s+doble/gi, "double bed"],
  [/cama\s+individual/gi, "single bed"],
  [/camas\s+individuales/gi, "single beds"],
  [/matrimoniales?/gi, "double beds"],
  [/individuales?/gi, "single beds"],
  [/cuchetas?/gi, "bunk beds"],
  [/literas?/gi, "bunk beds"],
  [/con\s+marinera/gi, "with a trundle bed"],
  [/cama\s+carrito/gi, "trundle bed"],
  [/sof[áa]\s*-?\s*cama/gi, "sofa bed"],
  [/sommier(?:es)?/gi, "sommier"],
  [/con\s+cama\s+carrito/gi, "with a trundle bed"],
  [/hay\s+un(?:a)?\s+un(?:a)?/gi, "there is a"],
  [/hay\s+un(?:a)?/gi, "there is a"],
  [/\be\b/gi, "and"],
  [/\by\b/gi, "and"],
  [/\bcon\b/gi, "with"],
  [/\ben\s+el\b/gi, "in the"],
  [/\bel\b/gi, "the"],
  [/\bun(?:a)?\b/gi, "a"],
]

/** Servicios guardados en español → etiqueta en inglés. */
export const ACCOMMODATION_SERVICE_EN: Record<string, string> = {
  Cochera: "Parking",
  "Cochera cubierta": "Covered parking",
  "Wi-Fi": "Wi-Fi",
  "Ropa de Cama y Toallas": "Linens & towels",
  "Ropa Blanca": "Linens & towels",
  Desayuno: "Breakfast",
  "Aire Acondicionado": "Air conditioning",
  Pileta: "Pool",
  "Pileta propia": "Private pool",
  Piscina: "Pool",
  "Estufa a leña": "Heating",
  Calefacción: "Heating",
  "Parrilla / Quincho": "Grill / BBQ area",
  Parrilla: "Grill / BBQ area",
  Asador: "Grill / BBQ area",
  Quincho: "Grill / BBQ area",
  "Parrillero / Quincho": "Grill / BBQ area",
  "Pet Friendly": "Pet Friendly",
  "Acepta Mascotas": "Pet Friendly",
  "Vista a la Montaña": "Mountain view",
  "Cerca de Río": "Near river",
  Accesibilidad: "Accessibility",
}

function formatEnglishList(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

function capitalizeFirst(text: string): string {
  const t = text.trim()
  if (!t) return t
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function polishEnglishText(text: string): string {
  return text
    .replace(/\ba\s+a\b/gi, "a")
    .replace(/\bthe\s+the\b/gi, "the")
    .replace(/\band\s+and\b/gi, "and")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function isBedTypeKey(value: unknown): value is BedTypeKey {
  return typeof value === "string" && VALID_BED_KEYS.has(value)
}

function normalizePolicyKey(value: unknown): CancelacionPoliticaKey | null {
  if (typeof value !== "string") return null
  const key = LEGACY_POLICY_KEY_ALIASES[value] ?? value
  return VALID_POLICY_KEYS.has(key) ? (key as CancelacionPoliticaKey) : null
}

function isCancelacionPoliticaKey(value: unknown): value is CancelacionPoliticaKey {
  return normalizePolicyKey(value) !== null
}

function normalizeBedItem(raw: unknown): DistribucionCamaItem | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as { tipoCamaKey?: unknown; cantidad?: unknown }
  if (!isBedTypeKey(row.tipoCamaKey)) return null
  const cantidad = Number(row.cantidad)
  if (!Number.isFinite(cantidad) || cantidad < 1) return null
  return { tipoCamaKey: row.tipoCamaKey, cantidad: Math.floor(cantidad) }
}

export function parseDistribucionCamas(raw: unknown): {
  items: DistribucionCamaItem[]
  legacyText: string | null
} {
  if (Array.isArray(raw)) {
    const items = raw.map(normalizeBedItem).filter((x): x is DistribucionCamaItem => Boolean(x))
    return { items, legacyText: null }
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (!trimmed) return { items: [], legacyText: null }
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) return parseDistribucionCamas(parsed)
      if (typeof parsed === "string") return parseDistribucionCamas(parsed)
    } catch {
      // texto libre legacy
    }
    return { items: [], legacyText: trimmed }
  }

  return { items: [], legacyText: null }
}

export function parseCancelacion(raw: unknown): {
  policy: CancelacionPolicy | null
  legacyText: string | null
} {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const row = raw as { politicaKey?: unknown; diasPreaviso?: unknown }
    const politicaKey = normalizePolicyKey(row.politicaKey)
    if (!politicaKey) return { policy: null, legacyText: null }

    const dias = row.diasPreaviso != null ? Number(row.diasPreaviso) : undefined
    if (politicaKey === "reembolso_dias_x") {
      if (!Number.isFinite(dias) || (dias as number) < 1) {
        return { policy: null, legacyText: null }
      }
      return {
        policy: { politicaKey, diasPreaviso: Math.floor(dias as number) },
        legacyText: null,
      }
    }
    return { policy: { politicaKey }, legacyText: null }
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (!trimmed) return { policy: null, legacyText: null }
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (parsed && typeof parsed === "object") return parseCancelacion(parsed)
      if (typeof parsed === "string") return parseCancelacion(parsed)
    } catch {
      // texto libre legacy
    }
    return { policy: null, legacyText: trimmed }
  }

  return { policy: null, legacyText: null }
}

function translateLegacyBedLayout(text: string): string {
  const normalized = normalizeLegacyKey(text)
  const exact = LEGACY_BED_EXACT_EN[normalized]
  if (exact) return exact

  if (/matrimoniales?\b/.test(normalized) && /\bindividuales?\b/.test(normalized) && /\bcuchetas?\b/.test(normalized)) {
    return "Double, Single, and Bunk Beds"
  }

  let result = text
  for (const [pattern, replacement] of BED_PHRASE_TO_EN) {
    result = result.replace(pattern, replacement)
  }
  return capitalizeFirst(polishEnglishText(result))
}

function translateLegacyCancellation(text: string): string {
  const normalized = normalizeLegacyKey(text)
  const exact = LEGACY_CANCEL_EXACT_EN[normalized]
  if (exact) return exact

  const refundDays = text.match(
    /reembolso\s+hasta\s+(\d+)\s*d[ií]as?\s+antes(?:\s+de\s+la\s+fecha\s+de\s+ingreso)?/i,
  )
  if (refundDays) {
    return `Full refund up to ${refundDays[1]} days before check-in`
  }

  if (/consultar\s+por\s+whatsapp/i.test(text)) return "Inquire via WhatsApp"
  if (/no\s+reembolsable|no\s+hay\s+reembolso/i.test(text)) return "Non-refundable Policy"
  if (/^a\s+convenir$/i.test(text.trim())) return "To be agreed"
  if (/reembolso\s+72\s*h(?:oras)?\s+antes/i.test(text)) {
    return "Cancel up to 72 hours before check-in for a full refund"
  }

  return capitalizeFirst(
    text
      .replace(/reembolso/gi, "refund")
      .replace(/cancelaci[oó]n/gi, "cancellation")
      .replace(/d[ií]as?/gi, "days")
      .replace(/antes/gi, "before")
      .replace(/ingreso/gi, "check-in")
      .replace(/consultar/gi, "inquire"),
  )
}

function detectStayInfoField(value: unknown): "beds" | "cancellation" {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "")
  if (/reembolso|cancelaci[oó]n|reembolsable|whatsapp|ingreso|convenir|disponibilidad/i.test(text)) {
    return "cancellation"
  }
  return "beds"
}

export function translateStayInfoValue(
  value: unknown,
  locale: AccommodationLocale,
  field: StayInfoField = "auto",
): string {
  const kind = field === "auto" ? detectStayInfoField(value) : field

  if (kind === "cancellation") {
    const { policy, legacyText } = parseCancelacion(value)
    if (policy) return formatCancellationPolicy(policy, locale)
    const legacy = String(legacyText ?? "").trim()
    if (!legacy) return ""
    if (locale === "es") return legacy
    return translateLegacyCancellation(legacy)
  }

  const { items, legacyText } = parseDistribucionCamas(value)
  if (items.length > 0) return formatBedLayout(items, locale)
  const legacy = String(legacyText ?? "").trim()
  if (!legacy) return ""
  if (locale === "es") return legacy
  return translateLegacyBedLayout(legacy)
}

export function normalizeBedItemsForCompare(items: DistribucionCamaItem[]): DistribucionCamaItem[] {
  return [...items]
    .filter((item) => isBedTypeKey(item.tipoCamaKey) && item.cantidad >= 1)
    .sort((a, b) => a.tipoCamaKey.localeCompare(b.tipoCamaKey))
}

export function serializeBedLayoutForCompare(raw: unknown): string {
  const { items, legacyText } = parseDistribucionCamas(raw)
  if (items.length > 0) return JSON.stringify(normalizeBedItemsForCompare(items))
  return normalizeLegacyKey(legacyText ?? "")
}

export function serializeCancellationForCompare(raw: unknown): string {
  const { policy, legacyText } = parseCancelacion(raw)
  if (policy) {
    return JSON.stringify({
      politicaKey: policy.politicaKey,
      diasPreaviso: policy.diasPreaviso ?? null,
    })
  }
  return normalizeLegacyKey(legacyText ?? "")
}

function bedItemLabel(item: DistribucionCamaItem, locale: AccommodationLocale): string {
  const labels = locale === "en" ? BED_TYPE_LABELS_EN : BED_TYPE_LABELS_ES
  const pair = labels[item.tipoCamaKey]
  const name = item.cantidad === 1 ? pair.singular : pair.plural
  return `${item.cantidad} ${name}`
}

export function formatBedLayout(items: DistribucionCamaItem[], locale: AccommodationLocale): string {
  if (items.length === 0) return ""
  const parts = normalizeBedItemsForCompare(items).map((item) => bedItemLabel(item, locale))
  if (locale === "en") return formatEnglishList(parts)
  return parts.join(", ")
}

export function formatCancellationPolicy(policy: CancelacionPolicy, locale: AccommodationLocale): string {
  const templates = locale === "en" ? CANCELLATION_LABELS_EN : CANCELLATION_LABELS_ES
  const template = templates[policy.politicaKey]
  if (policy.politicaKey === "reembolso_dias_x") {
    const dias = policy.diasPreaviso ?? 0
    return template.replace("{dias}", String(dias))
  }
  return template
}

export function renderBedLayout(raw: unknown, locale: AccommodationLocale): string {
  return translateStayInfoValue(raw, locale, "beds")
}

export function renderCancellation(raw: unknown, locale: AccommodationLocale): string {
  return translateStayInfoValue(raw, locale, "cancellation")
}

export function hasBedLayoutData(raw: unknown): boolean {
  const rendered = translateStayInfoValue(raw, "es", "beds")
  return Boolean(rendered.trim())
}

export function hasCancellationData(raw: unknown): boolean {
  const rendered = translateStayInfoValue(raw, "es", "cancellation")
  return Boolean(rendered.trim())
}

export function resolveAccommodationDescription(
  item: { descripcion?: string | null; descripcion_en?: string | null },
  locale: AccommodationLocale,
): string {
  if (locale === "es") return String(item.descripcion ?? "").trim()
  const en = String(item.descripcion_en ?? "").trim()
  if (en) return en
  return String(item.descripcion ?? "").trim()
}

export function translateAccommodationService(name: string, locale: AccommodationLocale): string {
  const trimmed = String(name ?? "").trim()
  if (!trimmed || locale === "es") return trimmed
  return ACCOMMODATION_SERVICE_EN[trimmed] ?? trimmed
}

export function emptyBedRow(): DistribucionCamaItem {
  return { tipoCamaKey: "sommier_matrimonial", cantidad: 1 }
}

export function bedRowsFromRaw(raw: unknown): DistribucionCamaItem[] {
  const { items } = parseDistribucionCamas(raw)
  return items.length > 0 ? items : [{ tipoCamaKey: "sommier_matrimonial", cantidad: 1 }]
}

export function cancellationFormFromRaw(raw: unknown): {
  politicaKey: CancelacionPoliticaKey | ""
  diasPreaviso: string
} {
  const { policy } = parseCancelacion(raw)
  if (!policy) return { politicaKey: "", diasPreaviso: "" }
  return {
    politicaKey: policy.politicaKey,
    diasPreaviso: policy.diasPreaviso != null ? String(policy.diasPreaviso) : "",
  }
}

export function buildCancelacionPayload(
  politicaKey: CancelacionPoliticaKey | "",
  diasPreaviso: string,
): CancelacionPolicy | null {
  if (!politicaKey) return null
  if (politicaKey === "reembolso_dias_x") {
    const dias = Number(String(diasPreaviso).trim())
    if (!Number.isFinite(dias) || dias < 1) return null
    return { politicaKey, diasPreaviso: Math.floor(dias) }
  }
  return { politicaKey }
}
