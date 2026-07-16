-- Blog gestionable desde el panel admin
-- Ejecutar en el SQL Editor de Supabase

create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title_es text not null,
  title_en text not null default '',
  excerpt_es text not null default '',
  excerpt_en text not null default '',
  paragraphs_es text[] not null default '{}',
  paragraphs_en text[] not null default '{}',
  category_es text not null default '',
  category_en text not null default '',
  image text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_status_published_at
  on public.blog_posts (status, published_at desc nulls last);

create index if not exists idx_blog_posts_slug
  on public.blog_posts (slug);

alter table public.blog_posts enable row level security;

drop policy if exists "Leer posts publicados del blog" on public.blog_posts;
create policy "Leer posts publicados del blog"
on public.blog_posts
for select
using (status = 'published');

-- INSERT / UPDATE / DELETE: solo vía service role en /api/admin/blog/*

-- Seed de los artículos actuales (idempotente por slug)
insert into public.blog_posts (
  slug,
  title_es, title_en,
  excerpt_es, excerpt_en,
  paragraphs_es, paragraphs_en,
  category_es, category_en,
  image,
  status,
  published_at
) values
(
  'guia-escapada-sierras-calculo',
  'Cómo planificar tu escapada a las Sierras de Córdoba',
  'Planning your Sierras de Córdoba getaway',
  'Temporadas, rutas recomendadas y consejos prácticos para combinar naturaleza, descanso y una visita a las termas sin estrés.',
  'Seasons, recommended routes and practical tips for combining nature, rest and Heated Pools visits without fuss.',
  array[
    'Elegir temporada y día de llegada marca la diferencia entre un viaje relajado y uno apretado. En primavera y otoño disfrutás colores cambiantes y temperaturas agradables; en verano hay más opciones para el agua.',
    'Combiná noches tranquilas en alojamiento verificado con al menos una visita a las termas y un paseo ligero por El Durazno o Villa Yacanto. Reservá con anticipación en fechas largas y consultá rutas antes de partir.'
  ],
  array[
    'Choosing your season and arrival day often defines whether a trip feels paced or rushed. Spring and autumn bring mild weather and changing colours; summer adds more water-centric plans.',
    'Pair verified accommodation with at least one Heated Pools visit and an easy walk around El Durazno or Villa Yacanto. Book early on long weekends and check road conditions before departing.'
  ],
  'Guías',
  'Guides',
  'https://ik.imagekit.io/vivilastermas/galeria/termas/pileta-exterior001.webp?q=80&w=900&auto=format&fit=crop',
  'published',
  '2026-05-01T12:00:00Z'
),
(
  'alojamiento-verificado-vs-reserva-directa',
  'Por qué importa elegir un alojamiento verificado',
  'Why choosing a verified stay matters',
  'Transparencia, fotos reales y asesoramiento local para que sepas exactamente qué esperar antes de reservar.',
  'Transparency, real photos and local guidance so you know exactly what to expect before you book.',
  array[
    'Un alojamiento verificado implica inspección, fotos coherentes con la propuesta y soporte ante dudas. Así elegís mejor y evitás sorpresas al llegar.',
    'Somos el punto de encuentro entre viajeros y prestadores locales. Cuando veas el sello Viví las Termas, sabés que detrás hay un compromiso real: recomendamos solo lo que conocemos y hemos verificado personalmente para asegurar que tu experiencia sea tal como la imaginaste.'
  ],
  array[
    'A verified stay involves on-site checks, photos that match reality and support when you still have questions — it helps you decide with confidence.',
    'We are the meeting point between travelers and local hosts. When you see the Viví las Termas badge, you know there is a real commitment behind it: we only recommend what we know and have personally verified to ensure your experience is just as you imagined it.'
  ],
  'Turismo responsable',
  'Responsible travel',
  'https://ik.imagekit.io/vivilastermas/entorno/bg-paginas/hero-alojamientos.webp?q=80&w=900&auto=format&fit=crop',
  'published',
  '2026-02-01T12:00:00Z'
),
(
  'termas-del-sol-que-esperar',
  'Termas Del Sol: qué incluye el pase y cómo llegar',
  'Termas del Sol: passes, tips and directions',
  'Horarios útiles, qué llevar en la mochila y cómo encajar las termas con tu día en El Durazno.',
  'Opening hours essentials, packing tips and fitting the Heated Pools into your El Durazno day.',
  array[
    'El circuito suele estar pensado para quedarse entre dos y cuatro horas: traé protector solar, gorro y calzado antideslizante para las zonas mojadas.',
    'Combiná tu visita con almuerzo o merienda en la zona para no apurar tiempos. Si venís desde Córdoba capital, controlá el clima y partí con margen en fin de semana largo.'
  ],
  array[
    'Most circuits are designed for stays of two to four hours — pack biodegradable sunscreen, a cap and sandals with grip for wet walkways.',
    'Pair your visit with a relaxed meal nearby so you are not rushing. Leaving from Córdoba capital, factor in peak traffic during holiday weekends.'
  ],
  'Termas',
  'Heated Pools',
  'https://ik.imagekit.io/vivilastermas/galeria/termas/pileta-interior001.webp?q=80&w=900&auto=format&fit=crop',
  'published',
  '2025-11-01T12:00:00Z'
),
(
  'experiencias-en-el-durazno-top-5',
  '5 experiencias naturales imperdibles cerca del complejo',
  'Five nature experiences not to miss nearby',
  'Desde trekking suave hasta sound healing al atardecer — ideas para quien quiere vivir algo más que el descanso en cabaña.',
  'From gentle hikes to sunset sound healing — ideas for guests who want more than a quiet cabin stay.',
  array[
    'El valle ofrece senderos suaves, miradores y actividades de bienestar que combinan con el ritmo de las termas.',
    'Reservá con tiempo actividades guiadas o masajes; en temporada alta los cupos vuelan. Escribinos y armamos un itinerario acorde a tu grupo y fechas.'
  ],
  array[
    'The valley offers gentle trails, lookouts and wellness activities that harmonise beautifully with Heated Pools outings.',
    'Book guided outings or massages in advance — seasonal weekends fill quickly. Reach out and we can sketch an itinerary tailored to your group.'
  ],
  'Experiencias',
  'Experiences',
  'https://ik.imagekit.io/vivilastermas/entorno/experiencias/actividades-yoga-rio.webp?q=80&w=900&auto=format&fit=crop',
  'published',
  '2025-10-01T12:00:00Z'
)
on conflict (slug) do nothing;
