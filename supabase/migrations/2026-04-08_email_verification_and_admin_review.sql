-- Email verification, moderation queue and Telegram/admin review
-- Safe to run on top of the existing schema.

CREATE TABLE IF NOT EXISTS reporters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT now(),
  last_seen_at      TIMESTAMPTZ DEFAULT now(),
  email             TEXT NOT NULL,
  email_normalized  TEXT NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  is_blocked        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  reporter_id         UUID NOT NULL REFERENCES reporters(id) ON DELETE CASCADE,
  report_id           UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  token_hash          TEXT NOT NULL UNIQUE,
  expires_at          TIMESTAMPTZ NOT NULL,
  sent_at             TIMESTAMPTZ DEFAULT now(),
  confirmed_at        TIMESTAMPTZ,
  reminder_1_sent_at  TIMESTAMPTZ,
  reminder_2_sent_at  TIMESTAMPTZ,
  bounced_at          TIMESTAMPTZ,
  invalidated_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS report_admin_reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  report_id           UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  channel             TEXT NOT NULL DEFAULT 'telegram'
                        CHECK (channel IN ('telegram', 'web_admin', 'system')),
  action              TEXT NOT NULL
                        CHECK (action IN ('queued', 'approved', 'rejected', 'needs_review')),
  actor               TEXT,
  note                TEXT,
  telegram_chat_id    TEXT,
  telegram_message_id TEXT
);

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES reporters(id) ON DELETE SET NULL;

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS visibility_status TEXT NOT NULL DEFAULT 'published'
  CHECK (visibility_status IN (
    'pending_email_verification',
    'pending_admin_review',
    'published',
    'rejected',
    'expired'
  ));

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS admin_review_status TEXT NOT NULL DEFAULT 'not_required'
  CHECK (admin_review_status IN (
    'not_required',
    'pending',
    'approved',
    'rejected',
    'needs_review'
  ));

ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_reviewed_by TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS telegram_message_id TEXT;

ALTER TABLE reporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_admin_reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reporters_email_normalized ON reporters (email_normalized);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_report_id ON email_verification_tokens (report_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_reporter_id ON email_verification_tokens (reporter_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_visibility_status ON reports (visibility_status);
CREATE INDEX IF NOT EXISTS idx_reports_admin_review_status ON reports (admin_review_status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_report_admin_reviews_report_id ON report_admin_reviews (report_id);

-- Existing repositories may already have a "public read" policy on reports.
-- Replace it so only published reports are visible publicly once this flow is implemented.
DROP POLICY IF EXISTS "public read" ON reports;
CREATE POLICY "public read" ON reports
  FOR SELECT USING (visibility_status = 'published');
