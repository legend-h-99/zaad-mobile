-- Consultation ownership hardening. Verify in an isolated database before deployment.
-- Specialist assignment requires trusted server provisioning.
begin;
alter table public.consultations enable row level security;
alter table public.consultations force row level security;
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
commit;
