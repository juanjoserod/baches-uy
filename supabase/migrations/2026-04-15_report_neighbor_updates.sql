-- Actualizaciones de vecinos para cada reporte.
-- No guarda emails en claro: solo hash para auditoria/abuso.

create table if not exists report_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  report_id uuid not null references reports(id) on delete cascade,
  author_alias text not null,
  author_email_hash text not null,
  commenter_hash text not null,
  update_type text not null check (
    update_type in (
      'still_there',
      'worse',
      'repaired_claim',
      'hazard',
      'formal_complaint',
      'general'
    )
  ),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  moderated_at timestamptz,
  hidden_reason text
);

alter table report_comments enable row level security;

drop policy if exists "public read published report comments" on report_comments;
create policy "public read published report comments" on report_comments
  for select
  using (status = 'published');

create index if not exists idx_report_comments_report_published
  on report_comments (report_id, created_at desc)
  where status = 'published';

create index if not exists idx_report_comments_report_status
  on report_comments (report_id, status, created_at desc);

create index if not exists idx_report_comments_email_hash
  on report_comments (author_email_hash);

create index if not exists idx_report_comments_commenter_hash
  on report_comments (commenter_hash);
