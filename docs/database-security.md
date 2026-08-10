# Database Security

This project stores health data, lab report text, medications, and meal plans in
Supabase/Postgres. The baseline security model should be:

- Row-Level Security is enabled and forced on every application table.
- Anonymous users can read only public recipe data.
- Authenticated users can read and mutate only rows they own.
- Rows with `profile_id` must point to a profile owned by the current user.
- The Supabase `service_role` key is server-only and must never ship in web or
  mobile bundles.

## Apply the hardening migration

Run:

```sh
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/security-hardening.sql
```

Or paste `scripts/security-hardening.sql` into the Supabase SQL editor.

For report-encryption preparation, also run:

```sh
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/lab-report-encryption-prep.sql
```

## Encryption

Supabase projects are encrypted at rest by default, which protects disks,
snapshots, and backups at the infrastructure layer. For extra protection of
especially sensitive fields such as `lab_reports.raw_text`,
`lab_reports.extracted_values`, `lab_reports.ai_assessment`,
`medications.dosage`, and free-text notes, use server-side column encryption:

1. Store the encryption key in Supabase Vault, not in the client app.
2. Encrypt/decrypt only from trusted backend routes or database functions.
3. Do not expose decrypted fields through direct client table reads.
4. Migrate one field family at a time so app reads do not break.

Official references used for this approach:

- Supabase RLS protects data at the database layer.
- Supabase Vault stores secrets encrypted at rest and exposes them through the
  `vault.decrypted_secrets` view for trusted SQL functions.
- PostgreSQL `pgcrypto` provides functions such as `pgp_sym_encrypt` and
  `pgp_sym_decrypt`; the key must stay server-side.

## Recommended next encryption migration

Create encrypted companion columns for lab-report OCR first, then update only
the report analysis API to write encrypted values. Once all reads go through a
server endpoint, drop direct client reads for the plaintext fields.
