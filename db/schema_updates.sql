/* SQL (ejecutar en Supabase Dashboard si el campo no existe)*/

alter table public.alojamientos_aprobados
  add column if not exists distribucion_camas text;

alter table public.alojamientos_pendientes
  add column if not exists latitud float8,
  add column if not exists longitud float8;

alter table public.alojamientos_aprobados
  add column if not exists latitud float8,
  add column if not exists longitud float8;

