-- Descripción en inglés para fichas de alojamiento (ES/EN)
ALTER TABLE alojamientos_aprobados
  ADD COLUMN IF NOT EXISTS descripcion_en text DEFAULT NULL;

ALTER TABLE alojamientos_pendientes
  ADD COLUMN IF NOT EXISTS descripcion_en text DEFAULT NULL;
