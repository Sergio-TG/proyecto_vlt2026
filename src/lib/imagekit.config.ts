export const IMAGE_FOLDERS = {
  ALOJAMIENTOS: "alojamientos",
  ENTORNO: "entorno",
  GALERIA: "galeria",
} as const;

export type ImageFolder = keyof typeof IMAGE_FOLDERS;

export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_URL_ENDPOINT;
export const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

export const IK_TRANSFORMS = {
  card: "tr=w-600,h-400,c-at_max,f-auto,q-80",
  heroPage: "tr=w-2560,f-auto,q-90",
  galMain: "tr=w-900,h-600,c-maintain_ratio,f-auto,q-85",
  galThumb: "tr=w-450,h-300,c-maintain_ratio,f-auto,q-75",
  galFull: "tr=w-1400,f-auto,q-90",
} as const;

export type IKTransform = keyof typeof IK_TRANSFORMS;

export const GALERIA_PREFIX_ORDER = [
  "portada",
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


export function buildGaleriaUrls(slug: string, archivos: string[], transform: IKTransform = "galThumb"): string[] {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "");
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
    return base ? `${base}/${rel}?${tr}` : `/${rel}?${tr}`;
  });
}

export function getAlojamientoPortada(slug: string, transform: IKTransform = "card"): string {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "");
  const tr = IK_TRANSFORMS[transform];

  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const rel = `${IMAGE_FOLDERS.ALOJAMIENTOS}/${cleanSlug}/portada.webp`;
  return base ? `${base}/${rel}?${tr}` : `/${rel}?${tr}`;
}

export function getHeroPagina(pagina: string, fallback: string = "hero-home"): string {
  const base = (IMAGEKIT_URL_ENDPOINT || "").trim().replace(/\/+$/, "");

  const clean = String(pagina || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  const heroBase = clean ? `hero-${clean}` : fallback;
  const rel = `${IMAGE_FOLDERS.ENTORNO}/bh-paginas/${heroBase}.webp`;

  return base ? `${base}/${rel}?${IK_TRANSFORMS.heroPage}` : `/${rel}?${IK_TRANSFORMS.heroPage}`;
}
