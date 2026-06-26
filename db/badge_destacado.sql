-- Badge de marketing manual por alojamiento (ejecutar en Supabase SQL Editor)

ALTER TABLE alojamientos_aprobados ADD COLUMN IF NOT EXISTS badge_destacado text DEFAULT NULL;
ALTER TABLE alojamientos_pendientes ADD COLUMN IF NOT EXISTS badge_destacado text DEFAULT NULL;

ALTER TABLE alojamientos_aprobados DROP CONSTRAINT IF EXISTS check_badge_destacado;
ALTER TABLE alojamientos_aprobados
ADD CONSTRAINT check_badge_destacado
CHECK (badge_destacado IS NULL OR badge_destacado IN ('mas_pedido', 'premium', 'eco_friendly', 'nuevo', 'familiar', 'romantico'));
