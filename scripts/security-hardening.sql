-- Zaad database security hardening
-- Run in Supabase SQL editor, or with psql using the project owner connection.
--
-- Goals:
-- 1. Keep the public API closed to anonymous users except public recipes.
-- 2. Make every user-owned table enforce ownership at the database layer.
-- 3. Prevent authenticated users from attaching rows to a profile they do not own.
-- 4. Enable pgcrypto for future server-side column encryption.
--
-- Notes:
-- - This migration is intentionally non-destructive: it does not rewrite existing
--   columns into encrypted blobs because the current app reads these fields
--   directly. Column encryption should be introduced from server routes together
--   with a Supabase Vault-managed key.
-- - Supabase service_role keeps BYPASSRLS behavior. Do not expose service_role
--   to the client.

begin;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.owns_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select target_profile_id is not null
    and exists (
      select 1
      from public.patient_profiles
      where id = target_profile_id
        and owner_user_id = auth.uid()
        and archived_at is null
    );
$$;

create or replace function app_private.can_read_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select target_profile_id is not null
    and exists (
      select 1
      from public.profile_memberships
      where profile_id = target_profile_id
        and user_id = auth.uid()
        and revoked_at is null
    );
$$;

revoke all on function app_private.owns_profile(uuid) from public, anon, authenticated;
revoke all on function app_private.can_read_profile(uuid) from public, anon, authenticated;

-- Explicit table grants. RLS still decides which rows are visible/mutable.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to anon, authenticated;

grant select on public.recipes to anon, authenticated;

grant select, insert, update, delete on
  public.patient_profiles,
  public.profile_memberships,
  public.health_profiles,
  public.medical_conditions,
  public.medications,
  public.food_preferences,
  public.lab_reports,
  public.meal_plans,
  public.progress_logs,
  public.consultations,
  public.lab_observations,
  public.health_measurements
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

revoke insert, update, delete on public.recipes from anon, authenticated;

alter table public.patient_profiles     enable row level security;
alter table public.profile_memberships  enable row level security;
alter table public.health_profiles      enable row level security;
alter table public.medical_conditions   enable row level security;
alter table public.medications          enable row level security;
alter table public.food_preferences     enable row level security;
alter table public.lab_reports          enable row level security;
alter table public.meal_plans           enable row level security;
alter table public.progress_logs        enable row level security;
alter table public.consultations        enable row level security;
alter table public.lab_observations     enable row level security;
alter table public.health_measurements  enable row level security;
alter table public.recipes              enable row level security;

alter table public.patient_profiles     force row level security;
alter table public.profile_memberships  force row level security;
alter table public.health_profiles      force row level security;
alter table public.medical_conditions   force row level security;
alter table public.medications          force row level security;
alter table public.food_preferences     force row level security;
alter table public.lab_reports          force row level security;
alter table public.meal_plans           force row level security;
alter table public.progress_logs        force row level security;
alter table public.consultations        force row level security;
alter table public.lab_observations     force row level security;
alter table public.health_measurements  force row level security;
alter table public.recipes              force row level security;

-- Replace older broad policies so this migration can be re-run.
drop policy if exists "owner access" on public.patient_profiles;
drop policy if exists "membership read" on public.profile_memberships;
drop policy if exists "membership owner manage" on public.profile_memberships;

drop policy if exists "own data" on public.health_profiles;
drop policy if exists "own data" on public.medical_conditions;
drop policy if exists "own data" on public.medications;
drop policy if exists "own data" on public.food_preferences;
drop policy if exists "own data" on public.lab_reports;
drop policy if exists "own data" on public.meal_plans;
drop policy if exists "own data" on public.progress_logs;
drop policy if exists "own data" on public.consultations;

drop policy if exists "member read" on public.lab_observations;
drop policy if exists "owner write" on public.lab_observations;
drop policy if exists "member read" on public.health_measurements;
drop policy if exists "owner write" on public.health_measurements;
drop policy if exists "recipes public" on public.recipes;

drop policy if exists "patient_profiles_owner_select" on public.patient_profiles;
drop policy if exists "patient_profiles_owner_insert" on public.patient_profiles;
drop policy if exists "patient_profiles_owner_update" on public.patient_profiles;
drop policy if exists "patient_profiles_owner_delete" on public.patient_profiles;

drop policy if exists "profile_memberships_member_select" on public.profile_memberships;
drop policy if exists "profile_memberships_owner_select" on public.profile_memberships;
drop policy if exists "profile_memberships_owner_insert" on public.profile_memberships;
drop policy if exists "profile_memberships_owner_update" on public.profile_memberships;
drop policy if exists "profile_memberships_owner_delete" on public.profile_memberships;

drop policy if exists "health_profiles_owner_select" on public.health_profiles;
drop policy if exists "health_profiles_owner_insert" on public.health_profiles;
drop policy if exists "health_profiles_owner_update" on public.health_profiles;
drop policy if exists "health_profiles_owner_delete" on public.health_profiles;

drop policy if exists "medical_conditions_owner_select" on public.medical_conditions;
drop policy if exists "medical_conditions_owner_insert" on public.medical_conditions;
drop policy if exists "medical_conditions_owner_update" on public.medical_conditions;
drop policy if exists "medical_conditions_owner_delete" on public.medical_conditions;

drop policy if exists "medications_owner_select" on public.medications;
drop policy if exists "medications_owner_insert" on public.medications;
drop policy if exists "medications_owner_update" on public.medications;
drop policy if exists "medications_owner_delete" on public.medications;

drop policy if exists "food_preferences_owner_select" on public.food_preferences;
drop policy if exists "food_preferences_owner_insert" on public.food_preferences;
drop policy if exists "food_preferences_owner_update" on public.food_preferences;
drop policy if exists "food_preferences_owner_delete" on public.food_preferences;

drop policy if exists "lab_reports_owner_select" on public.lab_reports;
drop policy if exists "lab_reports_owner_insert" on public.lab_reports;
drop policy if exists "lab_reports_owner_update" on public.lab_reports;
drop policy if exists "lab_reports_owner_delete" on public.lab_reports;

drop policy if exists "meal_plans_owner_select" on public.meal_plans;
drop policy if exists "meal_plans_owner_insert" on public.meal_plans;
drop policy if exists "meal_plans_owner_update" on public.meal_plans;
drop policy if exists "meal_plans_owner_delete" on public.meal_plans;

drop policy if exists "progress_logs_owner_select" on public.progress_logs;
drop policy if exists "progress_logs_owner_insert" on public.progress_logs;
drop policy if exists "progress_logs_owner_update" on public.progress_logs;
drop policy if exists "progress_logs_owner_delete" on public.progress_logs;

drop policy if exists "consultations_participant_select" on public.consultations;
drop policy if exists "consultations_requester_insert" on public.consultations;
drop policy if exists "consultations_participant_update" on public.consultations;
drop policy if exists "consultations_requester_delete" on public.consultations;

drop policy if exists "lab_observations_member_select" on public.lab_observations;
drop policy if exists "lab_observations_owner_insert" on public.lab_observations;
drop policy if exists "lab_observations_owner_update" on public.lab_observations;
drop policy if exists "lab_observations_owner_delete" on public.lab_observations;

drop policy if exists "health_measurements_member_select" on public.health_measurements;
drop policy if exists "health_measurements_owner_insert" on public.health_measurements;
drop policy if exists "health_measurements_owner_update" on public.health_measurements;
drop policy if exists "health_measurements_owner_delete" on public.health_measurements;

drop policy if exists "recipes_public_select" on public.recipes;

create policy "patient_profiles_owner_select"
  on public.patient_profiles for select
  using (auth.uid() is not null and owner_user_id = auth.uid());

create policy "patient_profiles_owner_insert"
  on public.patient_profiles for insert
  with check (auth.uid() is not null and owner_user_id = auth.uid());

create policy "patient_profiles_owner_update"
  on public.patient_profiles for update
  using (auth.uid() is not null and owner_user_id = auth.uid())
  with check (auth.uid() is not null and owner_user_id = auth.uid());

create policy "patient_profiles_owner_delete"
  on public.patient_profiles for delete
  using (auth.uid() is not null and owner_user_id = auth.uid());

create policy "profile_memberships_member_select"
  on public.profile_memberships for select
  using (auth.uid() is not null and user_id = auth.uid() and revoked_at is null);

create policy "profile_memberships_owner_select"
  on public.profile_memberships for select
  using (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "profile_memberships_owner_insert"
  on public.profile_memberships for insert
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "profile_memberships_owner_update"
  on public.profile_memberships for update
  using (auth.uid() is not null and app_private.owns_profile(profile_id))
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "profile_memberships_owner_delete"
  on public.profile_memberships for delete
  using (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "health_profiles_owner_select"
  on public.health_profiles for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "health_profiles_owner_insert"
  on public.health_profiles for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "health_profiles_owner_update"
  on public.health_profiles for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "health_profiles_owner_delete"
  on public.health_profiles for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "medical_conditions_owner_select"
  on public.medical_conditions for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "medical_conditions_owner_insert"
  on public.medical_conditions for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "medical_conditions_owner_update"
  on public.medical_conditions for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "medical_conditions_owner_delete"
  on public.medical_conditions for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "medications_owner_select"
  on public.medications for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "medications_owner_insert"
  on public.medications for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "medications_owner_update"
  on public.medications for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "medications_owner_delete"
  on public.medications for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "food_preferences_owner_select"
  on public.food_preferences for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "food_preferences_owner_insert"
  on public.food_preferences for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "food_preferences_owner_update"
  on public.food_preferences for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "food_preferences_owner_delete"
  on public.food_preferences for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "lab_reports_owner_select"
  on public.lab_reports for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "lab_reports_owner_insert"
  on public.lab_reports for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "lab_reports_owner_update"
  on public.lab_reports for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "lab_reports_owner_delete"
  on public.lab_reports for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "meal_plans_owner_select"
  on public.meal_plans for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "meal_plans_owner_insert"
  on public.meal_plans for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "meal_plans_owner_update"
  on public.meal_plans for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "meal_plans_owner_delete"
  on public.meal_plans for delete
  using (auth.uid() is not null and user_id = auth.uid());

create policy "progress_logs_owner_select"
  on public.progress_logs for select
  using (auth.uid() is not null and user_id = auth.uid());

create policy "progress_logs_owner_insert"
  on public.progress_logs for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "progress_logs_owner_update"
  on public.progress_logs for update
  using (auth.uid() is not null and user_id = auth.uid())
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and (profile_id is null or app_private.owns_profile(profile_id))
  );

create policy "progress_logs_owner_delete"
  on public.progress_logs for delete
  using (auth.uid() is not null and user_id = auth.uid());

do $$
declare policy_name text;
begin
  for policy_name in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'consultations'
  loop
    execute format('drop policy %I on public.consultations', policy_name);
  end loop;
end $$;
-- Only trusted provisioning may assign a dietitian. Clients cannot change identity.
create policy "consultations_select" on public.consultations for select to authenticated
  using (user_id = (select auth.uid()) or
    (dietitian_id = (select auth.uid()) and
     (select auth.jwt())->'app_metadata'->>'role' = 'dietitian'));
create policy "consultations_insert" on public.consultations for insert to authenticated
  with check (user_id = (select auth.uid()) and dietitian_id is null and
    (profile_id is null or exists (select 1 from public.patient_profiles p
      where p.id = profile_id and p.owner_user_id = (select auth.uid()))));
create policy "consultations_update" on public.consultations for update to authenticated
  using (user_id = (select auth.uid()) or
    (dietitian_id = (select auth.uid()) and
     (select auth.jwt())->'app_metadata'->>'role' = 'dietitian'))
  with check (user_id = (select auth.uid()) or
    (dietitian_id = (select auth.uid()) and
     (select auth.jwt())->'app_metadata'->>'role' = 'dietitian'));
create policy "consultations_delete" on public.consultations for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.guard_consultation_identity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if coalesce(auth.role(), '') not in ('service_role', '') then
    if TG_OP = 'INSERT' then
      if new.user_id is distinct from auth.uid() or new.dietitian_id is not null then
        raise exception 'Consultation requester must own the request. Assignment requires trusted provisioning.' using errcode = '42501';
      end if;
      if new.profile_id is not null and not exists (
        select 1 from public.patient_profiles p
        where p.id = new.profile_id and p.owner_user_id = auth.uid()
      ) then
        raise exception 'Consultation profile must belong to the requester.' using errcode = '42501';
      end if;
    elsif (new.id, new.user_id, new.dietitian_id, new.profile_id, new.created_at)
       is distinct from (old.id, old.user_id, old.dietitian_id, old.profile_id, old.created_at) then
      raise exception 'Consultation identity cannot be changed by clients.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_consultation_identity() from public;
drop trigger if exists consultations_identity_guard on public.consultations;
create trigger consultations_identity_guard before insert or update on public.consultations
  for each row execute function public.guard_consultation_identity();

create policy "lab_observations_member_select"
  on public.lab_observations for select
  using (auth.uid() is not null and app_private.can_read_profile(profile_id));

create policy "lab_observations_owner_insert"
  on public.lab_observations for insert
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "lab_observations_owner_update"
  on public.lab_observations for update
  using (auth.uid() is not null and app_private.owns_profile(profile_id))
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "lab_observations_owner_delete"
  on public.lab_observations for delete
  using (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "health_measurements_member_select"
  on public.health_measurements for select
  using (auth.uid() is not null and app_private.can_read_profile(profile_id));

create policy "health_measurements_owner_insert"
  on public.health_measurements for insert
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "health_measurements_owner_update"
  on public.health_measurements for update
  using (auth.uid() is not null and app_private.owns_profile(profile_id))
  with check (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "health_measurements_owner_delete"
  on public.health_measurements for delete
  using (auth.uid() is not null and app_private.owns_profile(profile_id));

create policy "recipes_public_select"
  on public.recipes for select
  using (true);

commit;
