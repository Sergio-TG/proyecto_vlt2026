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
}

export interface TaxonomiaServicio {
  id: string;
  nombre: string;
  categoria: string | null;
  icono_key: string | null;
  es_filtro_principal: boolean | null;
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

  return data as AlojamientoAprobado[];
}

function uniqueById(items: AlojamientoAprobado[]) {
  const map = new Map<string, AlojamientoAprobado>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

function toPostgresTextArrayLiteral(values: string[]) {
  const escaped = values.map((v) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  return `{${escaped.join(",")}}`;
}

function logPostgrestError(prefix: string, error: unknown) {
  console.error(prefix, {
    message: (error as { message?: string })?.message,
    details: (error as { details?: string })?.details,
    hint: (error as { hint?: string })?.hint,
    code: (error as { code?: string })?.code,
    raw: String(error),
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

  const baseServicios = [...requiredServicios];

  const serviceVariants: string[][] = [];
  if (allowLegacyParking && baseServicios.includes("Cochera")) {
    serviceVariants.push(baseServicios);
    serviceVariants.push(baseServicios.map((s) => (s === "Cochera" ? "Cochera cubierta" : s)));
  } else {
    serviceVariants.push(baseServicios);
  }

  const runQuery = async (opts: { servicios: string[]; mascotasEq?: boolean }) => {
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
          logPostgrestError(`Error fetching alojamientos (filtered, mode=${mode}):`, error);
          return;
        }
        hadSuccess = true;
        parts.push(...((data ?? []) as AlojamientoAprobado[]));
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

  for (const servicios of serviceVariants) {
    if (!requirePet) {
      results.push(...(await runQuery({ servicios })));
      continue;
    }

    results.push(...(await runQuery({ servicios, mascotasEq: true })));
    results.push(...(await runQuery({ servicios: [...servicios, "Pet Friendly"] })));
  }

  return uniqueById(results);
}

export async function getTaxonomiaServicios() {
  const { data, error } = await supabase
    .from("taxonomia_servicios")
    .select("*")
    .order("es_filtro_principal", { ascending: false })
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching taxonomia_servicios:", {
      message: (error as { message?: string })?.message,
      details: (error as { details?: string })?.details,
      hint: (error as { hint?: string })?.hint,
      code: (error as { code?: string })?.code,
    });
    return [];
  }

  return (data ?? []) as TaxonomiaServicio[];
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
