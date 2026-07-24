export const IMAGE_FOLDERS = {
  ALOJAMIENTOS: "alojamientos",
  ENTORNO: "entorno",
  GALERIA: "galeria",
  PRESTADORES: "prestadores",
} as const;

export type ImageFolder = keyof typeof IMAGE_FOLDERS;

export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_URL_ENDPOINT;

/** URL origin de ImageKit (sin barra final). Si falta `.env`, se usa el endpoint del proyecto. */
export function getResolvedImageKitBase(): string {
  const fromEnv = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "");
  return fromEnv || "https://ik.imagekit.io/vivilastermas";
}

export const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

export const IK_TRANSFORMS = {
  card: "tr=w-600,h-400,c-at_max,f-auto,q-80",
  heroPage: "tr=w-2560,f-auto,q-90",
  galMain: "tr=w-900,h-600,c-maintain_ratio,f-auto,q-85",
  galThumb: "tr=w-450,h-300,c-maintain_ratio,f-auto,q-75",
  galFull: "tr=w-1400,f-auto,q-90",
  reviewThumb: "tr=w-150,h-150,fo-auto",
  reviewFull: "tr=w-1400,f-auto,q-85",
  blogCover: "tr=w-1920,f-auto,q-90",
  blogCard: "tr=w-1200,f-auto,q-85",
} as const;

export type IKTransform = keyof typeof IK_TRANSFORMS;

/** Convierte `updatedAt` de ImageKit a parámetro de bust de caché (epoch ms). */
export function imageKitCacheVersion(isoOrMs?: string | number | null): string | null {
  if (isoOrMs == null || isoOrMs === "") return null
  if (typeof isoOrMs === "number" && Number.isFinite(isoOrMs)) return String(Math.floor(isoOrMs))
  const ms = Date.parse(String(isoOrMs))
  return Number.isFinite(ms) ? String(ms) : null
}

export function appendImageKitCacheVersion(query: string, version: string | null): string {
  if (!version) return query
  return `${query}&updatedAt=${version}`
}

export const GALERIA_PREFIX_ORDER = [
  "portada",
  "frente",
  "recepcion",
  "habitacion",
  "dormitorio",
  "bano",
  "pileta",
  "spa",
  "jacuzzi",
  "terraza",
  "balcon",
  "patio",
  "jardin",
  "parrilla",
  "quincho",
  "sauna",
  "cocina",
  "kitchenette",
  "comedor",
  "vista",
  "aerea",
  "dron",
  "cochera",
] as const;

export function sortGaleriaFiles(nombres: string[]): string[] {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const getPrioridad = (nombre: string): number => {
    const base = normalize(nombre)
      .split("?")[0]
      ?.replace(/\.[^.]+$/, "") ?? "";

    const idx = GALERIA_PREFIX_ORDER.findIndex((prefix) => {
      const p = normalize(prefix)
      if (base === p) return true
      if (base.startsWith(`${p}-`) || base.startsWith(`${p}_`)) return true
      if (new RegExp(`^${p}\\d`).test(base)) return true
      if (base.startsWith(p) && base.length > p.length) return true
      if (base.includes(`-${p}`) || base.includes(`_${p}`)) return true
      return false
    });
    return idx === -1 ? 999 : idx;
  };

  return [...nombres]
    .map((n) => n.trim())
    .filter(Boolean)
    .sort((a, b) => {
      const pa = getPrioridad(a);
      const pb = getPrioridad(b);
      if (pa !== pb) return pa - pb;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
}


export function buildGaleriaUrls(
  slug: string,
  archivos: string[],
  transform: IKTransform = "galThumb",
  updatedAtByName?: Record<string, string>,
): string[] {
  const base = getResolvedImageKitBase().replace(/\/+$/, "");
  const tr = IK_TRANSFORMS[transform];

  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return archivos.map((nombre) => {
    const clean = String(nombre || "")
      .trim()
      .replace(/^\/+/, "");

    const withoutQuery = clean.split("?")[0] ?? clean;
    const extMatch = withoutQuery.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch?.[1]?.toLowerCase();
    const hasExt = Boolean(ext);
    const baseName = withoutQuery.replace(/\.[^.]+$/, "");
    const fileName = hasExt ? `${baseName}.${ext}` : `${baseName}.webp`;

    const rel = `${IMAGE_FOLDERS.ALOJAMIENTOS}/${cleanSlug}/${fileName}`;
    const version = imageKitCacheVersion(
      updatedAtByName?.[fileName] ?? updatedAtByName?.[withoutQuery] ?? updatedAtByName?.[nombre],
    );
    return `${base}/${rel}?${appendImageKitCacheVersion(tr, version)}`;
  });
}

/** URLs públicas para archivos en ImageKit `galeria/termas/` (listados vía API). */
export function buildGaleriaTermasUrls(archivos: string[], transform: IKTransform = "galThumb"): string[] {
  return buildFolderGaleriaUrls(`${IMAGE_FOLDERS.GALERIA}/termas`, archivos, transform);
}

/** URLs públicas para archivos en ImageKit `prestadores/{slug}/` (listados vía API). */
export function buildGaleriaPrestadorUrls(
  slug: string,
  archivos: string[],
  transform: IKTransform = "galThumb",
): string[] {
  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  return buildFolderGaleriaUrls(`${IMAGE_FOLDERS.PRESTADORES}/${cleanSlug}`, archivos, transform);
}

function buildFolderGaleriaUrls(
  folderPrefix: string,
  archivos: string[],
  transform: IKTransform = "galThumb",
): string[] {
  const base = getResolvedImageKitBase().replace(/\/+$/, "");
  const tr = IK_TRANSFORMS[transform];
  const prefix = String(folderPrefix || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return archivos.map((nombre) => {
    const clean = String(nombre || "")
      .trim()
      .replace(/^\/+/, "");

    const withoutQuery = clean.split("?")[0] ?? clean;
    const extMatch = withoutQuery.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch?.[1]?.toLowerCase();
    const hasExt = Boolean(ext);
    const baseName = withoutQuery.replace(/\.[^.]+$/, "");
    const fileName = hasExt ? `${baseName}.${ext}` : `${baseName}.webp`;

    const rel = `${prefix}/${fileName}`;
    return `${base}/${rel}?${tr}`;
  });
}

export function getAlojamientoPortada(slug: string, transform: IKTransform = "card"): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "");
  const tr = IK_TRANSFORMS[transform];

  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const rel = `${IMAGE_FOLDERS.ALOJAMIENTOS}/${cleanSlug}/portada.webp`;
  return `${base}/${rel}?${tr}`;
}

export function getHeroPagina(pagina: string, fallback: string = "hero-home"): string {
  const base = getResolvedImageKitBase().replace(/\/+$/, "");

  const clean = String(pagina || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const heroBase = clean ? `hero-${clean}` : fallback;
  const rel = `${IMAGE_FOLDERS.ENTORNO}/bg-paginas/${heroBase}.webp`;

  return `${base}/${rel}?${IK_TRANSFORMS.heroPage}`;
}

/** Aplica transformación ImageKit sobre la URL base (sin query previa). */
export function withImageKitTransform(url: string, transform: IKTransform): string {
  const base = String(url || "").trim().split("?")[0]
  if (!base) return ""
  return `${base}?${IK_TRANSFORMS[transform]}`
}

/**
 * Reescribe URLs de ImageKit del blog quitando transforms viejos (p.ej. w=900)
 * y aplicando una variante de alta calidad. Otras URLs se devuelven tal cual.
 */
export function resolveBlogImageUrl(
  url: string,
  variant: "blogCover" | "blogCard" = "blogCover",
): string {
  const raw = String(url || "").trim()
  if (!raw) return ""

  try {
    const parsed = new URL(raw)
    if (!parsed.hostname.includes("imagekit.io")) return raw

    const updatedAt = parsed.searchParams.get("updatedAt")
    const base = `${parsed.origin}${parsed.pathname}`
    const tr = IK_TRANSFORMS[variant]
    return updatedAt ? `${base}?${tr}&updatedAt=${encodeURIComponent(updatedAt)}` : `${base}?${tr}`
  } catch {
    return withImageKitTransform(raw, variant) || raw
  }
}

