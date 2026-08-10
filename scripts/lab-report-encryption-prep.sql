-- Zaad lab report encryption preparation
--
-- This migration is safe to run before application code is updated. It adds
-- encrypted companion columns but does not remove or overwrite plaintext fields.
-- Next step: update the trusted reports/analyze backend route to write encrypted
-- values, then stop selecting plaintext sensitive fields from clients.

begin;

create extension if not exists pgcrypto;

alter table public.lab_reports
  add column if not exists raw_text_ciphertext bytea,
  add column if not exists extracted_values_ciphertext bytea,
  add column if not exists ai_assessment_ciphertext bytea,
  add column if not exists nutrition_flags_ciphertext bytea,
  add column if not exists encrypted_at timestamptz;

comment on column public.lab_reports.raw_text_ciphertext is
  'pgcrypto-encrypted copy of raw_text. Decrypt only from trusted backend code.';
comment on column public.lab_reports.extracted_values_ciphertext is
  'pgcrypto-encrypted JSON copy of extracted_values. Decrypt only from trusted backend code.';
comment on column public.lab_reports.ai_assessment_ciphertext is
  'pgcrypto-encrypted JSON copy of ai_assessment. Decrypt only from trusted backend code.';
comment on column public.lab_reports.nutrition_flags_ciphertext is
  'pgcrypto-encrypted JSON copy of nutrition_flags. Decrypt only from trusted backend code.';

commit;
