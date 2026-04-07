-- Tabla principal de reportes de baches
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  lat             FLOAT8 NOT NULL,
  lng             FLOAT8 NOT NULL,
  address         TEXT NOT NULL,
  department      TEXT NOT NULL,
  road_type       TEXT NOT NULL CHECK (road_type IN ('calle', 'vereda', 'ciclovia', 'camino')),
  status          TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'confirmado', 'enviado', 'reparado', 'cerrado')),
  description     TEXT,
  email           TEXT NOT NULL,
  photos          TEXT[] DEFAULT '{}',
  confirmed_count INT NOT NULL DEFAULT 0,
  sent_confirmed_count INT NOT NULL DEFAULT 0,
  repair_confirmed_count INT NOT NULL DEFAULT 0,
  status_updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  repaired_at     TIMESTAMPTZ
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS sent_confirmed_count INT NOT NULL DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS repair_confirmed_count INT NOT NULL DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS repaired_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS report_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('confirm_exists', 'confirm_sent', 'confirm_repaired')),
  voter_hash  TEXT NOT NULL
);

-- Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "public read" ON reports
  FOR SELECT USING (true);

-- Inserción pública
CREATE POLICY "public insert" ON reports
  FOR INSERT WITH CHECK (true);

-- Actualización pública (para confirmar baches)
CREATE POLICY "public update confirmed_count" ON reports
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "public read votes" ON report_votes
  FOR SELECT USING (false);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_department ON reports (department);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_votes_unique
  ON report_votes (report_id, vote_type, voter_hash);
CREATE INDEX IF NOT EXISTS idx_report_votes_report_id ON report_votes (report_id);

-- Storage bucket para fotos (ejecutar en el dashboard de Supabase):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true);
-- CREATE POLICY "public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-photos');
-- CREATE POLICY "public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'report-photos');
--
-- Alternativa más segura:
-- usar una ruta del servidor con SUPABASE_SERVICE_ROLE_KEY para subir fotos
-- sin depender de políticas públicas de INSERT sobre storage.objects.
