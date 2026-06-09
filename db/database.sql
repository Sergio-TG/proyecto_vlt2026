create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Permitir suscripción pública"
on public.newsletter_subscribers
for insert
with check (true);

create policy "Privacidad total: nadie lee"
on public.newsletter_subscribers
for select
using (false);

-- Reseñas de alojamientos (formulario público en ficha de detalle)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  alojamiento_id uuid not null,
  nombre_usuario text not null,
  estrellas_alojamiento smallint not null check (estrellas_alojamiento between 1 and 5),
  estrellas_plataforma smallint not null check (estrellas_plataforma between 1 and 5),
  comentario text default '',
  fotos text[] not null default '{}',
  aprobada boolean not null default false,
  created_at timestamptz default now()
);

-- Si la tabla ya existía sin campos nuevos:
alter table public.reviews add column if not exists aprobada boolean not null default false;
alter table public.reviews add column if not exists fotos text[] not null default '{}';

alter table public.reviews enable row level security;

drop policy if exists "Permitir insertar reseñas públicas" on public.reviews;
drop policy if exists "Reseñas privadas hasta moderación" on public.reviews;
drop policy if exists "Leer reseñas aprobadas" on public.reviews;

create policy "Permitir insertar reseñas públicas"
on public.reviews
for insert
with check (true);

create policy "Leer reseñas aprobadas"
on public.reviews
for select
using (aprobada = true);

-- UPDATE y DELETE: solo vía service role en rutas /api/admin/reviews/* (RLS deniega al anon key).
