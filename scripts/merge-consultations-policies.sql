-- Merge public.consultations RLS policies to reduce Supabase performance warnings.
--
-- This preserves the current access model:
-- - SELECT/UPDATE: requester can access their consultation; dietitian can also
--   access it when the table has a dietitian_id column.
-- - INSERT: only the requester can create a row for their own user_id.
-- - DELETE: only the requester can delete their own row.
--
-- It replaces multiple permissive policies per action with one policy per action.

begin;

do $$
declare
  has_dietitian_id boolean;
  participant_check text;
begin
  if to_regclass('public.consultations') is null then
    raise notice 'public.consultations does not exist; skipping policy merge.';
    return;
  end if;

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

  alter table public.consultations enable row level security;
  alter table public.consultations force row level security;

  drop policy if exists "consultations_owner_select" on public.consultations;
  drop policy if exists "consultations_participant_select" on public.consultations;
  drop policy if exists "consultations_owner_insert" on public.consultations;
  drop policy if exists "consultations_requester_insert" on public.consultations;
  drop policy if exists "consultations_owner_update" on public.consultations;
  drop policy if exists "consultations_participant_update" on public.consultations;
  drop policy if exists "consultations_owner_delete" on public.consultations;
  drop policy if exists "consultations_requester_delete" on public.consultations;

  execute format(
    'create policy "consultations_select" on public.consultations for select to authenticated using (%s)',
    participant_check
  );

  create policy "consultations_insert"
    on public.consultations for insert to authenticated
    with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

  execute format(
    'create policy "consultations_update" on public.consultations for update to authenticated using (%s) with check (%s)',
    participant_check,
    participant_check
  );

  create policy "consultations_delete"
    on public.consultations for delete to authenticated
    using ((select auth.uid()) is not null and user_id = (select auth.uid()));
end $$;

commit;

-- Verify: should return one policy per action for public.consultations.
select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'consultations'
order by cmd, policyname;
