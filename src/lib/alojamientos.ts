import { supabase } from './supabase';

export interface Alojamiento {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  servicios: string[];
  rating_google: number;
  precio: number;
  localidad: string;
  tipo_alojamiento: string;
  imagen_principal: string; // Nombre del archivo, ej: principal.jpg
  galeria?: string[];
  estado_revision: 'pendiente' | 'aprobado' | 'rechazado';
  links_reservas: {
    whatsapp?: string;
    booking?: string;
    airbnb?: string;
    web?: string;
  };
  features: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
    wifi: boolean;
    ac: boolean;
    pool: boolean;
    pet: boolean;
  };
  logistics: {
    distanceToTermas: string;
    roadType: string;
    accessWarning?: string;
  };
}

export async function getAlojamientos() {
  try {
    console.log('Fetching from table: alojamientos_aprobados...');
    const { data, error, status, statusText } = await supabase
      .from('alojamientos_aprobados')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Supabase Error Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status,
        statusText
      });
      
      // Intentar sin el sufijo _aprobados por si acaso
      console.log('Intentando con tabla "alojamientos"...');
      const { data: data2, error: error2 } = await supabase
        .from('alojamientos')
        .select('*')
        .eq('estado_revision', 'aprobado');
        
      if (!error2) return data2 as Alojamiento[];
      
      return [];
    }

    // Si funciona el select *, aplicar filtros manualmente o ver qué hay
    console.log('Data fetched successfully, count:', data?.length);
    return data as Alojamiento[];
  } catch (err) {
    console.error('Unexpected error in getAlojamientos:', err);
    return [];
  }
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

  return data as Alojamiento;
}
