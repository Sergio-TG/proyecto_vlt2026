-- Categorías canónicas del blog (slug estable + labels ES/EN sincronizados).
-- Ejecutar en el SQL Editor de Supabase.
-- Compatible con posts existentes: se agrega category_slug y se migra desde labels legacy.

alter table public.blog_posts
  add column if not exists category_slug text not null default '';

comment on column public.blog_posts.category_slug is
  'Slug canónico de categoría (ej. guias-escapadas). Ver catálogo en src/lib/blog-categories.ts';

create index if not exists idx_blog_posts_category_slug
  on public.blog_posts (category_slug)
  where category_slug <> '';

-- Migración de labels legacy → slug canónico
update public.blog_posts set category_slug = 'guias-escapadas'
where category_slug = ''
  and (
    lower(trim(category_es)) in ('guías', 'guias', 'guías & escapadas', 'guias & escapadas')
    or lower(trim(category_en)) in ('guides', 'guides & getaways')
  );

update public.blog_posts set category_slug = 'bienestar-termas'
where category_slug = ''
  and (
    lower(trim(category_es)) in ('termas', 'bienestar & termas')
    or lower(trim(category_en)) in ('heated pools', 'wellness & heated pools')
  );

update public.blog_posts set category_slug = 'alojamientos-turismo-responsable'
where category_slug = ''
  and (
    lower(trim(category_es)) in ('turismo responsable', 'alojamientos & turismo responsable')
    or lower(trim(category_en)) in ('responsible travel', 'stays & responsible travel')
  );

update public.blog_posts set category_slug = 'experiencias-naturaleza'
where category_slug = ''
  and (
    lower(trim(category_es)) in ('experiencias', 'experiencias & naturaleza')
    or lower(trim(category_en)) in ('experiences', 'experiences & nature')
  );

update public.blog_posts set category_slug = 'entrevistas-voces-locales'
where category_slug = ''
  and (
    lower(trim(category_es)) like '%entrevista%'
    or lower(trim(category_es)) like '%voces locales%'
    or lower(trim(category_es)) like '%historias de monta%'
    or lower(trim(category_en)) like '%interview%'
    or lower(trim(category_en)) like '%local voices%'
  );

-- Sincronizar labels ES/EN con el catálogo canónico
update public.blog_posts set
  category_es = 'Guías & Escapadas',
  category_en = 'Guides & Getaways'
where category_slug = 'guias-escapadas';

update public.blog_posts set
  category_es = 'Bienestar & Termas',
  category_en = 'Wellness & Heated Pools'
where category_slug = 'bienestar-termas';

update public.blog_posts set
  category_es = 'Alojamientos & Turismo Responsable',
  category_en = 'Stays & Responsible Travel'
where category_slug = 'alojamientos-turismo-responsable';

update public.blog_posts set
  category_es = 'Experiencias & Naturaleza',
  category_en = 'Experiences & Nature'
where category_slug = 'experiencias-naturaleza';

update public.blog_posts set
  category_es = 'Entrevistas & Voces Locales',
  category_en = 'Interviews & Local Voices'
where category_slug = 'entrevistas-voces-locales';
