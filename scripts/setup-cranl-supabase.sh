#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f ".env.seed.local" ]; then
  echo "Missing .env.seed.local. Copy .env.seed.local.example first."
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env.seed.local
set +a

if [ -n "${SUPABASE_DB_URL:-}" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    node scripts/apply-schema.mjs
  else
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f /Users/hossam/Documents/zaad/app/src/lib/supabase/schema.sql
  fi
else
  echo "SUPABASE_DB_URL is empty, skipping schema setup."
  echo "Run /Users/hossam/Documents/zaad/app/src/lib/supabase/schema.sql in Cranl/Supabase SQL editor, or add the connection string."
fi
