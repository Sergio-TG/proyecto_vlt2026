-- =============================================================================
-- GUÍA: Perfiles (RBAC) + Row Level Security (RLS)
-- Ejecutar en el SQL Editor de Supabase (proyecto de producción / staging).
-- =============================================================================
-- Objetivo:
--   1) Tener una tabla `profiles` con rol (`admin` | `socio`) por usuario.
--   2) Que un socio solo pueda LEER/EDITAR filas donde auth.uid() = user_id.
--   3) Que los admins (vía profiles.role = 'admin') puedan operar con más alcance
--      o, si preferís, seguir usando service_role solo en APIs de servidor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabla de perfiles (fuente de verdad de roles para el App Router)
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'socio'
    check (role in ('admin', 'socio')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Cada usuario puede leer SU propio perfil (necesario para RBAC en Server Components).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- El usuario puede actualizar datos no privilegiados de su perfil.
-- IMPORTANTE: no permitimos que cambie su propio `role` desde el cliente.
drop policy if exists "profiles_update_own_safe" on public.profiles;
create policy "profiles_update_own_safe"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

-- Inserts/changes de rol: solo service_role (APIs admin / triggers).
-- (El service_role bypasea RLS; no hace falta policy de insert para authenticated.)

-- ---------------------------------------------------------------------------
-- 2) Trigger: crear perfil automáticamente al registrar un usuario
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'socio')
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- ---------------------------------------------------------------------------
-- 3) Backfill: sincronizar perfiles existentes + admins
-- ---------------------------------------------------------------------------
insert into public.profiles (id, email, role)
select u.id, u.email, 'socio'
from auth.users u
on conflict (id) do nothing;

update public.profiles p
set role = 'admin',
    updated_at = now()
from public.admin_users a
where a.user_id = p.id
  and a.active = true;

-- ---------------------------------------------------------------------------
-- 4) Helper: ¿el usuario autenticado es admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) RLS en tablas críticas de alojamientos
--    Ajustá los nombres si en tu proyecto usás otras tablas (p.ej. reservas).
-- ---------------------------------------------------------------------------

-- 5.a) Pendientes (borrador / alta del socio)
alter table public.alojamientos_pendientes enable row level security;

drop policy if exists "pendientes_select_own_or_admin" on public.alojamientos_pendientes;
create policy "pendientes_select_own_or_admin"
on public.alojamientos_pendientes
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "pendientes_insert_own" on public.alojamientos_pendientes;
create policy "pendientes_insert_own"
on public.alojamientos_pendientes
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "pendientes_update_own_or_admin" on public.alojamientos_pendientes;
create policy "pendientes_update_own_or_admin"
on public.alojamientos_pendientes
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "pendientes_delete_own_or_admin" on public.alojamientos_pendientes;
create policy "pendientes_delete_own_or_admin"
on public.alojamientos_pendientes
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- 5.b) Aprobados (catálogo público + edición del dueño/admin)
alter table public.alojamientos_aprobados enable row level security;

-- Lectura pública del catálogo (solo filas activas / no borradas lógicamente).
drop policy if exists "aprobados_select_public" on public.alojamientos_aprobados;
create policy "aprobados_select_public"
on public.alojamientos_aprobados
for select
to anon, authenticated
using (deleted_at is null);

-- El socio dueño (o admin) puede actualizar SU ficha publicada.
drop policy if exists "aprobados_update_own_or_admin" on public.alojamientos_aprobados;
create policy "aprobados_update_own_or_admin"
on public.alojamientos_aprobados
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- Insert/delete de aprobados: preferible solo via service_role en APIs admin.
-- Si querés permitir insert autenticado controlado:
-- drop policy if exists "aprobados_insert_admin" on public.alojamientos_aprobados;
-- create policy "aprobados_insert_admin"
-- on public.alojamientos_aprobados
-- for insert to authenticated
-- with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6) Ejemplo genérico para una tabla `reservas` (si la usás / la creás)
-- ---------------------------------------------------------------------------
-- create table if not exists public.reservas (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references auth.users (id) on delete cascade,
--   alojamiento_id uuid,
--   created_at timestamptz not null default now()
-- );
--
-- alter table public.reservas enable row level security;
--
-- create policy "reservas_select_own_or_admin"
-- on public.reservas for select to authenticated
-- using (auth.uid() = user_id or public.is_admin());
--
-- create policy "reservas_insert_own"
-- on public.reservas for insert to authenticated
-- with check (auth.uid() = user_id);
--
-- create policy "reservas_update_own_or_admin"
-- on public.reservas for update to authenticated
-- using (auth.uid() = user_id or public.is_admin())
-- with check (auth.uid() = user_id or public.is_admin());
--
-- create policy "reservas_delete_own_or_admin"
-- on public.reservas for delete to authenticated
-- using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 7) Checklist operativo
-- ---------------------------------------------------------------------------
-- [ ] Ejecutar este script en Supabase SQL Editor.
-- [ ] Verificar que usuarios nuevos reciben profiles.role = 'socio'.
-- [ ] Al aceptar invitación admin, marcar profiles.role = 'admin'
--     (la API /api/admin/accept-invite ya intenta hacerlo).
-- [ ] Probar con un socio: solo ve/edita SUS filas (auth.uid() = user_id).
-- [ ] Probar con un no-admin entrando a /admin → redirect a /no-autorizado.
-- [ ] Mantener service_role SOLO en variables de entorno de servidor (.env),
--     nunca en el cliente.
