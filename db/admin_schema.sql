--SQL (ejecutar en Supabase Dashboard si no existe la tabla)--

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text,
  role text,
  active boolean not null default true,
  invited_by uuid,
  created_at timestamptz not null default now()
);

