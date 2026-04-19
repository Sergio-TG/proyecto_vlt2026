-- Script para agregar columnas faltantes a alojamientos_aprobados
-- Esto asegura que todos los datos del formulario de socios se guarden correctamente.

ALTER TABLE alojamientos_aprobados 
ADD COLUMN IF NOT EXISTS propietario text,
ADD COLUMN IF NOT EXISTS distribucion_camas text,
ADD COLUMN IF NOT EXISTS distancia_termas text,
ADD COLUMN IF NOT EXISTS tipo_acceso text,
ADD COLUMN IF NOT EXISTS perfiles jsonb,
ADD COLUMN IF NOT EXISTS mascotas text,
ADD COLUMN IF NOT EXISTS check_in text,
ADD COLUMN IF NOT EXISTS check_out text,
ADD COLUMN IF NOT EXISTS cancelacion text,
ADD COLUMN IF NOT EXISTS acepta_ninos text;
