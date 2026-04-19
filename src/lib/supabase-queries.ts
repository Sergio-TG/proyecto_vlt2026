import { supabase } from './supabase';

export interface AlojamientoAprobado {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  servicios: string[];
  precio_base: number | null;
  noches_minimas: number | null;
  rating_google: number | null;
  localidad: string;
  tipo_alojamiento: string;
  capacidad_total?: number | null;
  acepta_ninos?: string | null;
  mascotas?: string | null;
  direccion?: string | null;
  google_maps?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  distribucion_camas?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  cancelacion?: string | null;
}

export type TaxonomiaServicio = {
  id: string;
  nombre: string;
  categoria: string;
  icono_key: string;
  es_filtro_principal: boolean;
};

export async function getTaxonomiaServicios(): Promise<TaxonomiaServicio[]> {
  const { data, error } = await supabase
    .from("taxonomia_servicios")
    .select("*")
    .order("es_filtro_principal", { ascending: false })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[Supabase] Error al cargar taxonomia_servicios:", error);
    return [];
  }

  if (!data) return [];

  return (data as unknown as Array<{
    id: unknown;
    nombre: unknown;
    categoria: unknown;
    icono_key: unknown;
    es_filtro_principal: unknown;
  }>).map((row) => ({
    id: String(row.id || ""),
    nombre: String(row.nombre || "").trim(),
    categoria: String(row.categoria || "Otros").trim() || "Otros",
    icono_key: String(row.icono_key || "").trim(),
    es_filtro_principal: Boolean(row.es_filtro_principal),
  })).filter((x) => x.id && x.nombre);
}

export async function getAlojamientos() {
  const { data, error } = await supabase
    .from('alojamientos_aprobados')
    .select('*');

  if (error) {
    console.error('Error fetching alojamientos:', {
      message: (error as { message?: string })?.message,
      details: (error as { details?: string })?.details,
      hint: (error as { hint?: string })?.hint,
      code: (error as { code?: string })?.code,
    });
    return [];
  }

  return (data ?? []).map(normalizeAlojamiento);
}

function uniqueById(items: AlojamientoAprobado[]) {
  const map = new Map<string, AlojamientoAprobado>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

function normalizeServicioName(value: string) {
  const s = value.trim();
  if (s.length === 0) return null;
  if (/^(tipo|capacidad)\s*:/i.test(s)) return null;
  if (s === "Asador" || s === "Parrilla" || s === "Quincho" || s === "Parrillero / Quincho") return "Parrilla / Quincho";
  if (s === "Ropa Blanca") return "Ropa de Cama y Toallas";
  if (s === "Cochera cubierta") return "Cochera";
  if (s === "Pileta propia" || s === "Piscina") return "Pileta";
  if (s === "Acepta Mascotas") return "Pet Friendly";
  return s;
}

function parseServiciosFromUnknown(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((v) => String(v));
  if (typeof raw !== "string") return [];

  const t = raw.trim();
  if (t.length === 0) return [];

  if (t.startsWith("[") && t.endsWith("]")) {
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    } catch {
    }
  }

  if (t.startsWith("{") && t.endsWith("}")) {
    const inner = t.slice(1, -1);
    return inner
      .split(",")
      .map((p) => p.trim().replace(/^"+|"+$/g, ""))
      .filter(Boolean);
  }

  return t
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeServicios(raw: unknown) {
  const list = parseServiciosFromUnknown(raw)
    .map(normalizeServicioName)
    .filter((s): s is string => Boolean(s));

  return Array.from(new Set(list));
}

function normalizeAlojamiento(item: unknown): AlojamientoAprobado {
  const raw = item as { servicios?: unknown };
  const servicios = normalizeServicios(raw?.servicios);
  return {
    ...(item as AlojamientoAprobado),
    servicios,
  };
}

function toPostgresTextArrayLiteral(values: string[]) {
  const escaped = values.map((v) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  return `{${escaped.join(",")}}`;
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function logPostgrestError(prefix: string, error: unknown) {
  console.error(prefix, {
    message: (error as { message?: string })?.message,
    details: (error as { details?: string })?.details,
    hint: (error as { hint?: string })?.hint,
    code: (error as { code?: string })?.code,
    raw: String(error),
    json: safeStringify(error),
    keys: typeof error === "object" && error !== null ? Object.keys(error as Record<string, unknown>) : [],
  });
}

export async function getAlojamientosFiltered(input: {
  requiredServicios?: string[];
  localidades?: string[];
  requirePet?: boolean;
  allowLegacyParking?: boolean;
}) {
  const requiredServicios = input.requiredServicios ?? [];
  const localidades = input.localidades ?? [];
  const requirePet = input.requirePet ?? false;
  const allowLegacyParking = input.allowLegacyParking ?? true;

  const hasFilters = requiredServicios.length > 0 || localidades.length > 0 || requirePet;
  if (!hasFilters) return getAlojamientos();

  let serviciosKind: "array" | "text" | "unknown" = "unknown";
  const { data: probeData, error: probeError } = await supabase
    .from("alojamientos_aprobados")
    .select("servicios")
    .limit(1);

  if (probeError) {
    logPostgrestError("Error probing servicios type:", probeError);
  } else {
    const first = (probeData ?? [])[0] as { servicios?: unknown } | undefined;
    const v = first?.servicios;
    if (Array.isArray(v)) serviciosKind = "array";
    else if (typeof v === "string") serviciosKind = "text";
  }

  const baseServicios = [...requiredServicios];

  const serviceVariants: string[][] = [];
  serviceVariants.push(baseServicios);

  if (allowLegacyParking && baseServicios.includes("Cochera")) {
    serviceVariants.push(baseServicios.map((s) => (s === "Cochera" ? "Cochera cubierta" : s)));
  }

  if (baseServicios.includes("Pileta")) {
    serviceVariants.push(baseServicios.map((s) => (s === "Pileta" ? "Piscina" : s)));
    serviceVariants.push(baseServicios.map((s) => (s === "Pileta" ? "Pileta propia" : s)));
  }

  if (baseServicios.includes("Parrilla / Quincho")) {
    serviceVariants.push(baseServicios.map((s) => (s === "Parrilla / Quincho" ? "Parrilla" : s)));
    serviceVariants.push(baseServicios.map((s) => (s === "Parrilla / Quincho" ? "Asador" : s)));
    serviceVariants.push(baseServicios.map((s) => (s === "Parrilla / Quincho" ? "Quincho" : s)));
    serviceVariants.push(baseServicios.map((s) => (s === "Parrilla / Quincho" ? "Parrillero / Quincho" : s)));
  }

  const normalizedVariants = Array.from(new Set(serviceVariants.map((v) => v.join("|"))))
    .map((key) => key.split("|").filter(Boolean));

  const runQuery = async (opts: { servicios: string[]; mascotasEq?: boolean }) => {
    if (serviciosKind === "text") {
      const runAttempt = async (mascotasValue?: "Sí" | true) => {
        let q = supabase.from("alojamientos_aprobados").select("*");

        for (const service of opts.servicios) {
          q = q.ilike("servicios", `%${service}%`);
        }

        if (localidades.length > 0) {
          q = q.in("localidad", localidades);
        }

        if (typeof mascotasValue !== "undefined") {
          q = q.eq("mascotas", mascotasValue);
        }

        const { data, error } = await q;
        if (error) {
          logPostgrestError("Error fetching alojamientos (filtered, mode=ilike):", error);
          return [] as AlojamientoAprobado[];
        }

        return (data ?? []).map(normalizeAlojamiento);
      };

      if (opts.mascotasEq === true) {
        const a = await runAttempt("Sí");
        const b = await runAttempt(true);
        return uniqueById([...a, ...b]);
      }

      return await runAttempt();
    }

    const tryMode = async (mode: "contains" | "cs_literal") => {
      const parts: AlojamientoAprobado[] = [];
      let hadSuccess = false;

      const runAttempt = async (mascotasValue?: "Sí" | true) => {
        let q = supabase.from("alojamientos_aprobados").select("*");

        if (opts.servicios.length > 0) {
          if (mode === "contains") {
            q = q.contains("servicios", opts.servicios);
          } else {
            q = q.filter("servicios", "cs", toPostgresTextArrayLiteral(opts.servicios));
          }
        }

        if (localidades.length > 0) {
          q = q.in("localidad", localidades);
        }

        if (typeof mascotasValue !== "undefined") {
          q = q.eq("mascotas", mascotasValue);
        }

        const { data, error } = await q;
        if (error) {
          return;
        }
        hadSuccess = true;
        parts.push(...((data ?? []).map(normalizeAlojamiento)));
      };

      if (opts.mascotasEq === true) {
        await runAttempt("Sí");
        await runAttempt(true);
      } else {
        await runAttempt();
      }

      if (!hadSuccess) return null;
      return uniqueById(parts);
    };

    const primary = await tryMode("contains");
    if (primary) return primary;

    const fallback = await tryMode("cs_literal");
    if (fallback) return fallback;

    return await getAlojamientos();
  };

  const results: AlojamientoAprobado[] = [];

  for (const servicios of normalizedVariants) {
    if (!requirePet) {
      results.push(...(await runQuery({ servicios })));
      continue;
    }

    results.push(...(await runQuery({ servicios, mascotasEq: true })));
    results.push(...(await runQuery({ servicios: [...servicios, "Pet Friendly"] })));
  }

  return uniqueById(results);
}

export async function getAlojamientoBySlug(slug: string) {
  const { data, error } = await supabase
    .from('alojamientos_aprobados')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching alojamiento with slug ${slug}:`, error);
    return null;
  }

  return data as AlojamientoAprobado;
}
