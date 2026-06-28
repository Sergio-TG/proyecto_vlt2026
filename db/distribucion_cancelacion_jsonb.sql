-- Migra distribucion_camas y cancelacion de text a jsonb estructurado.
-- Ejecutar en Supabase SQL Editor.

ALTER TABLE alojamientos_pendientes
  ALTER COLUMN distribucion_camas TYPE jsonb
  USING (
    CASE
      WHEN distribucion_camas IS NULL OR btrim(distribucion_camas::text) = '' THEN '[]'::jsonb
      WHEN btrim(distribucion_camas::text) ~ '^\[' THEN distribucion_camas::jsonb
      ELSE to_jsonb(distribucion_camas::text)
    END
  );

ALTER TABLE alojamientos_pendientes
  ALTER COLUMN cancelacion TYPE jsonb
  USING (
    CASE
      WHEN cancelacion IS NULL OR btrim(cancelacion::text) = '' THEN NULL
      WHEN btrim(cancelacion::text) ~ '^\{' THEN cancelacion::jsonb
      ELSE to_jsonb(cancelacion::text)
    END
  );

ALTER TABLE alojamientos_aprobados
  ALTER COLUMN distribucion_camas TYPE jsonb
  USING (
    CASE
      WHEN distribucion_camas IS NULL OR btrim(distribucion_camas::text) = '' THEN '[]'::jsonb
      WHEN btrim(distribucion_camas::text) ~ '^\[' THEN distribucion_camas::jsonb
      ELSE to_jsonb(distribucion_camas::text)
    END
  );

ALTER TABLE alojamientos_aprobados
  ALTER COLUMN cancelacion TYPE jsonb
  USING (
    CASE
      WHEN cancelacion IS NULL OR btrim(cancelacion::text) = '' THEN NULL
      WHEN btrim(cancelacion::text) ~ '^\{' THEN cancelacion::jsonb
      ELSE to_jsonb(cancelacion::text)
    END
  );

ALTER TABLE alojamientos_pendientes
  ALTER COLUMN distribucion_camas SET DEFAULT '[]'::jsonb;
