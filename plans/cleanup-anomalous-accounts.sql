-- ─────────────────────────────────────────────────────────────────────────────
-- Zaad — cleanup for anomalous auth accounts
-- Project: cvqghvyljzxhtkjrwrvy ("saas")
-- Written 2026-07-30 by the improve advisor. REVIEW-ONLY — nothing here was run.
--
-- Context: a live check found accounts that never completed registration —
-- stuck unconfirmed (email confirmation is ON) and/or missing a health_profiles
-- row (profiles are created only when onboarding completes; there is no trigger).
--
-- HOW TO USE: run Section 1 first (read-only) to see the current state. Then, if
-- you want to remediate, UNCOMMENT exactly one option in Section 2 and run it.
-- The write statements are commented out on purpose. Take a backup first.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Section 1 · Diagnostics (safe, read-only) ────────────────────────────────

-- 1a. Headline counts
select
  (select count(*) from auth.users)                                            as total_users,
  (select count(*) from auth.users where email_confirmed_at is null)           as unconfirmed,
  (select count(*) from auth.users
     where email_confirmed_at is null
       and created_at < now() - interval '1 day')                             as stale_unconfirmed_gt_1d,
  (select count(*) from auth.users u
     where not exists (select 1 from public.health_profiles h
                        where h.user_id = u.id))                              as users_without_profile;

-- 1b. The specific accounts (inspect before doing anything)
select
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  (u.email_confirmed_at is not null)                             as is_confirmed,
  exists (select 1 from public.health_profiles h
          where h.user_id = u.id)                                as has_profile
from auth.users u
where u.email_confirmed_at is null
   or not exists (select 1 from public.health_profiles h where h.user_id = u.id)
order by u.created_at;


-- ── Section 2 · Remediation options (UNCOMMENT ONE; take a backup first) ──────

-- Option A — DELETE stale never-activated accounts.
--   Use when: these are abandoned sign-ups you want gone. Destructive & final.
--   Only targets accounts unconfirmed for >1 day AND with no profile, so it will
--   not remove anyone who actually started using the app. Deleting from
--   auth.users cascades to public rows via their user_id FKs (verify FK ON DELETE
--   behavior in your schema before running).
--
-- delete from auth.users u
-- where u.email_confirmed_at is null
--   and u.created_at < now() - interval '1 day'
--   and not exists (select 1 from public.health_profiles h where h.user_id = u.id);


-- Option B — MANUALLY CONFIRM stale unconfirmed accounts (activate them).
--   Use when: you'd rather let these users in (e.g. you are disabling email
--   confirmation going forward). They will still have no health_profiles row, so
--   they must complete onboarding on next login (see the app-side follow-up note).
--
-- update auth.users
-- set email_confirmed_at = coalesce(email_confirmed_at, now()),
--     confirmed_at       = coalesce(confirmed_at, now())
-- where email_confirmed_at is null
--   and created_at < now() - interval '1 day';


-- ── Section 3 · Confirmed-but-profileless users (no data fix — informational) ─
--   These users are active but never finished onboarding, so their profile data
--   does not exist and cannot be fabricated. The durable fix is app-side: route
--   authenticated users with no health_profiles row into /onboarding on login
--   (a separate follow-up; NOT covered by plans 001–013). This query just lists
--   who they are so you can decide (e.g. prompt them to complete their profile).
--
-- select u.id, u.email, u.created_at
-- from auth.users u
-- where u.email_confirmed_at is not null
--   and not exists (select 1 from public.health_profiles h where h.user_id = u.id)
-- order by u.created_at;
