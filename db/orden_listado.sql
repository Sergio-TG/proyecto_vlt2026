-- Orden de aparición en home (top 10) y catálogo /alojamientos
-- Ejecutar en Supabase SQL Editor

ALTER TABLE alojamientos_aprobados ADD COLUMN IF NOT EXISTS orden_listado integer DEFAULT NULL;

-- Hostería El Durazno primero; el resto puede ajustarse con 2, 3, 4…
UPDATE alojamientos_aprobados
SET orden_listado = 1
WHERE slug = 'hosteria-el-durazno';

-- Índice opcional para consultas ordenadas
CREATE INDEX IF NOT EXISTS idx_alojamientos_aprobados_orden_listado
ON alojamientos_aprobados (orden_listado NULLS LAST);
