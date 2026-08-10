-- Zaad database security hardening for the current mobile schema.
--
-- Run this instead of scripts/security-hardening.sql if your database does not
-- have patient_profiles/profile_memberships yet.
--
-- It protects the tables used by the current Expo app:
-- health_profiles, medical_conditions, food_preferences, medications,
-- progress_logs, lab_reports, meal_plans, consultations, and recipes.

begin;

create extension if not exists pgcrypto;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to anon, authenticated;
grant usage, select on all sequences in schema public to authenticated;

do $$
declare
  table_name text;
  user_owned_tables text[] := array[
    'health_profiles',
    'medical_conditions',
    'food_preferences',
    'medications',
    'progress_logs',
    'lab_reports',
    'meal_plans'
  ];
begin
  foreach table_name in array user_owned_tables loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
      execute format('alter table public.%I enable row level security', table_name);
      execute format('alter table public.%I force row level security', table_name);

      execute format('drop policy if exists "owner_select" on public.%I', table_name);
      execute format('drop policy if exists "owner_insert" on public.%I', table_name);
      execute format('drop policy if exists "owner_update" on public.%I', table_name);
      execute format('drop policy if exists "owner_delete" on public.%I', table_name);

      execute format(
        'create policy "owner_select" on public.%I for select to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()))',
        table_name
      );
      execute format(
        'create policy "owner_insert" on public.%I for insert to authenticated with check ((select auth.uid()) is not null and user_id = (select auth.uid()))',
        table_name
      );
      execute format(
        'create policy "owner_update" on public.%I for update to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid())) with check ((select auth.uid()) is not null and user_id = (select auth.uid()))',
        table_name
      );
      execute format(
        'create policy "owner_delete" on public.%I for delete to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()))',
        table_name
      );
    end if;
  end loop;
end $$;

do $$
declare
  has_dietitian_id boolean;
  participant_check text;
begin
  if to_regclass('public.consultations') is not null then
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'consultations'
        and column_name = 'dietitian_id'
    )
    into has_dietitian_id;

    participant_check := case
      when has_dietitian_id then
        '((select auth.uid()) is not null and (user_id = (select auth.uid()) or dietitian_id = (select auth.uid())))'
      else
        '((select auth.uid()) is not null and user_id = (select auth.uid()))'
    end;

    grant select, insert, update, delete on public.consultations to authenticated;
    alter table public.consultations enable row level security;
    alter table public.consultations force row level security;

    drop policy if exists "consultations_participant_select" on public.consultations;
    drop policy if exists "consultations_requester_insert" on public.consultations;
    drop policy if exists "consultations_participant_update" on public.consultations;
    drop policy if exists "consultations_requester_delete" on public.consultations;

    execute format(
      'create policy "consultations_participant_select" on public.consultations for select to authenticated using (%s)',
      participant_check
    );

    create policy "consultations_requester_insert"
      on public.consultations for insert to authenticated
      with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

    execute format(
      'create policy "consultations_participant_update" on public.consultations for update to authenticated using (%s) with check (%s)',
      participant_check,
      participant_check
    );

    create policy "consultations_requester_delete"
      on public.consultations for delete to authenticated
      using ((select auth.uid()) is not null and user_id = (select auth.uid()));
  end if;
end $$;

do $$
begin
  if to_regclass('public.recipes') is not null then
    grant select on public.recipes to anon, authenticated;
    revoke insert, update, delete on public.recipes from anon, authenticated;
    alter table public.recipes enable row level security;
    alter table public.recipes force row level security;

    drop policy if exists "recipes_public_select" on public.recipes;
    create policy "recipes_public_select"
      on public.recipes for select
      using (true);
  end if;
end $$;

commit;
