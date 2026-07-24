-- Fix RLS del bucket podcasts (error: "new row violates row-level security policy").
-- Ejecutar en el SQL Editor de Supabase si ya corriste blog_media_gallery.sql antes.
--
-- Causa: la policy antigua hacía EXISTS sobre public.admin_users, pero esa tabla
-- suele tener RLS sin SELECT para el usuario autenticado → el EXISTS siempre falla.
-- Solución: usar public.is_admin() (SECURITY DEFINER) definida en profiles_and_rls.sql.
--
-- Además, la app ahora sube vía /api/admin/blog/audio con service_role (bypass RLS).

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
