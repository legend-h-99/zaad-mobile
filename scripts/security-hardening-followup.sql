-- Zaad security hardening follow-up.
--
-- Use after reviewing pg_policies output. This keeps public nutrition/catalog
-- tables readable, closes unused public care-link policies, and hardens seed data.

begin;

-- Public catalog tables: readable by everyone, not writable by client roles.
do $$
declare
  table_name text;
  catalog_tables text[] := array[
    'branded_foods',
    'food_items',
    'food_standards',
    'nutrition_sources',
    'recipe_ingredients'
  ];
begin
  foreach table_name in array catalog_tables loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('grant select on public.%I to anon, authenticated', table_name);
      execute format('revoke insert, update, delete on public.%I from anon, authenticated', table_name);
      execute format('alter table public.%I enable row level security', table_name);
      execute format('alter table public.%I force row level security', table_name);
    end if;
  end loop;
end $$;

-- Care links: remove public access, keep the owner policies. The web app's
-- POST /api/care/share needs "patient_manage_own_link" and
-- "patient_write_own_snapshot", and caregivers read through
-- get_care_snapshot(p_token) from app/src/lib/supabase/care-link-token-rpc-migration.sql.
-- RLS is not forced here: that security definer function runs as the table
-- owner and would find no rows under forced RLS.
do $$
begin
  if to_regclass('public.care_links') is not null then
    drop policy if exists "public_read_by_token" on public.care_links;
    revoke all on public.care_links from anon;
  end if;

  if to_regclass('public.care_snapshots') is not null then
    drop policy if exists "public_read_snapshot_via_link" on public.care_snapshots;
    revoke all on public.care_snapshots from anon;
  end if;
end $$;

-- Seed/demo helper data should never be client-visible.
do $$
begin
  if to_regclass('public.zaad_fake_users_seed') is not null then
    revoke all on public.zaad_fake_users_seed from anon, authenticated;
    alter table public.zaad_fake_users_seed enable row level security;
    alter table public.zaad_fake_users_seed force row level security;
  end if;
end $$;

commit;
