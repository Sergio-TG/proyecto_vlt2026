-- Eliminar columnas de enlaces a plataformas externas (Booking / Airbnb)
-- Ejecutar en Supabase SQL Editor después de verificar que el código ya no las referencia.

ALTER TABLE alojamientos_aprobados DROP COLUMN IF EXISTS link_booking;
ALTER TABLE alojamientos_aprobados DROP COLUMN IF EXISTS link_airbnb;

ALTER TABLE alojamientos_pendientes DROP COLUMN IF EXISTS link_booking;
ALTER TABLE alojamientos_pendientes DROP COLUMN IF EXISTS link_airbnb;
