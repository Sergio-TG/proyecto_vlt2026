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
}

export async function getAlojamientos() {
  const { data, error } = await supabase
    .from('alojamientos_aprobados')
    .select('id, nombre, slug, descripcion, servicios, precio_base, noches_minimas, rating_google, localidad, tipo_alojamiento');

  if (error) {
    console.error('Error fetching alojamientos:', error);
    return [];
  }

  return data as AlojamientoAprobado[];
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
