-- Tabla de eventos de interacción del sitio público
-- Ejecutar en Supabase SQL Editor
--
-- event_type admitidos por la API:
--   clic_alojamiento, clic_contacto, clic_reserva_termas,
--   page_view (target_id = slug), service_interest (target_id = nombre del servicio),
--   consult_agency (target_id = provider id), direct_provider (target_id = provider id)

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (char_length(event_type) <= 80),
  target_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_target_id ON analytics_events (target_id) WHERE target_id IS NOT NULL;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Inserción pública desde el frontend (anon key)
DROP POLICY IF EXISTS "Allow public insert analytics_events" ON analytics_events;
CREATE POLICY "Allow public insert analytics_events"
  ON analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Lectura solo vía service role (panel admin)
