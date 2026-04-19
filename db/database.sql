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