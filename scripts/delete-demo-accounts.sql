-- Delete Zaad demo/fake accounts from Supabase Auth and related public data.
--
-- Run the PREVIEW query first. Run the DELETE transaction only after confirming
-- the matched emails are demo accounts such as *.demo@zaad.app.

-- PREVIEW
select
  id,
  email,
  created_at,
  raw_user_meta_data
from auth.users
where email ilike '%.demo@zaad.app'
   or raw_user_meta_data->>'demo' = 'true'
order by email;

-- DELETE
begin;

do $$
declare
  target_table text;
  has_user_id boolean;
  has_dietitian_id boolean;
  user_tables text[] := array[
    'care_links',
    'care_snapshots',
    'consultations',
    'food_preferences',
    'health_profiles',
    'lab_reports',
    'meal_plans',
    'medical_conditions',
    'medications',
    'progress_logs'
  ];
begin
  drop table if exists demo_users_to_delete;

  create temporary table demo_users_to_delete on commit drop as
    select id
    from auth.users
    where email ilike '%.demo@zaad.app'
       or raw_user_meta_data->>'demo' = 'true';

  foreach target_table in array user_tables loop
    if to_regclass(format('public.%I', target_table)) is not null then
      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = target_table
          and column_name = 'user_id'
      )
      into has_user_id;

      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = target_table
          and column_name = 'dietitian_id'
      )
      into has_dietitian_id;

      if has_user_id and has_dietitian_id then
        execute format(
          'delete from public.%I where user_id in (select id from demo_users_to_delete) or dietitian_id in (select id from demo_users_to_delete)',
          target_table
        );
      elsif has_user_id then
        execute format(
          'delete from public.%I where user_id in (select id from demo_users_to_delete)',
          target_table
        );
      end if;
    end if;
  end loop;

  if to_regclass('public.zaad_fake_users_seed') is not null then
    delete from public.zaad_fake_users_seed;
  end if;

  delete from auth.identities
  where user_id in (select id from demo_users_to_delete);

  delete from auth.users
  where id in (select id from demo_users_to_delete);
end $$;

commit;

-- VERIFY
select
  count(*) as remaining_demo_users
from auth.users
where email ilike '%.demo@zaad.app'
   or raw_user_meta_data->>'demo' = 'true';
