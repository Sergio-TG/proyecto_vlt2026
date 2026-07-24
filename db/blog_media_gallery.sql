-- Soporte de audio (podcast) + galería multimedia (imágenes/videos) para el blog.
-- Ejecutar en el SQL Editor de Supabase.
-- 100% compatible con posts existentes: las columnas nuevas son opcionales
-- y tienen defaults seguros, no requieren backfill.

-- 1) Columnas nuevas en blog_posts -------------------------------------------------

alter table public.blog_posts
  add column if not exists audio_url text not null default '';

alter table public.blog_posts
  add column if not exists audio_title text not null default '';

-- Galería: array de objetos { url, type: 'image' | 'video', caption? }
alter table public.blog_posts
  add column if not exists gallery jsonb not null default '[]'::jsonb;

comment on column public.blog_posts.audio_url is 'URL pública del audio/podcast en Supabase Storage (bucket podcasts).';
comment on column public.blog_posts.audio_title is 'Título/descripción corta opcional del episodio de audio.';
comment on column public.blog_posts.gallery is 'Galería multimedia adicional a la imagen de portada: [{ url, type: "image"|"video", caption? }], en orden de despliegue.';

-- 2) Bucket de Storage para podcasts ------------------------------------------------
-- Público para lectura (reproducción directa), tamaño máx. 45MB (límite tier free
-- de Supabase) y solo MIME types de audio permitidos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcasts',
  'podcasts',
  true,
  47185920, -- 45 MB en bytes
  array[
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/ogg',
    'audio/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3) Políticas RLS sobre storage.objects para el bucket 'podcasts' ------------------
-- Lectura: pública.
-- Escritura: admins vía public.is_admin() (SECURITY DEFINER). Evita el fallo
-- típico "new row violates row-level security policy" cuando la policy consultaba
-- admin_users bajo RLS sin permiso de SELECT.
-- Nota: la app sube audio por /api/admin/blog/audio con service_role (bypass RLS);
-- estas policies quedan como red de seguridad para accesos autenticados.

drop policy if exists "podcasts_public_read" on storage.objects;
create policy "podcasts_public_read"
on storage.objects
for select
using (bucket_id = 'podcasts');

drop policy if exists "podcasts_admin_insert" on storage.objects;
create policy "podcasts_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'podcasts'
  and public.is_admin()
);

drop policy if exists "podcasts_admin_update" on storage.objects;
create policy "podcasts_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'podcasts'
  and public.is_admin()
)
with check (
  bucket_id = 'podcasts'
  and public.is_admin()
);

drop policy if exists "podcasts_admin_delete" on storage.objects;
create policy "podcasts_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'podcasts'
  and public.is_admin()
);
