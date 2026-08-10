# Plan 005: Handle the silent no-op login path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/login.tsx"`
> If output is non-empty, compare the "Current state" excerpt below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (shares `login.tsx` with 002–004, 006, 007 — run sequentially)
- **Category**: bug (correctness)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

`handleLogin` handles two outcomes — an auth error, and a success with a session —
but not the third: **no error and no session**. In that case the loading spinner
stops and *nothing* happens: no message, no navigation. The user is stuck staring
at an unchanged form with no idea why. This can occur with certain Supabase
configurations (for example when email confirmation is required and the response
carries a user but no session). A one-line fallback error closes the gap so the UI
always gives feedback.

## Current state

`app/(auth)/login.tsx` lines 76–89 (inside the `try` of `handleLogin`):

```tsx
const { data, error: authError } = await supabase.auth.signInWithPassword({
  email: email.trim().toLowerCase(),
  password,
})

if (authError) {
  setError('تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.')
} else if (data.session) {
  setSession(data.session)
  router.replace('/(tabs)')
}
```

There is no `else` — the "no error, no session" branch falls through silently.
`setError` and the existing Arabic error strings are already in this component.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |

## Scope

**In scope**:
- `app/(auth)/login.tsx` — add one `else` branch inside `handleLogin`.

**Out of scope**:
- The `catch` block and `finally` block — leave them unchanged.
- Register / forgot-password.

## Git workflow

- Branch: `advisor/005-login-silent-noop`
- Commit: `Show fallback error when login returns no session`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Add the fallback `else` branch

Change the `if / else if` above to add a final `else`:

```tsx
if (authError) {
  setError('تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.')
} else if (data.session) {
  setSession(data.session)
  router.replace('/(tabs)')
} else {
  setError('تعذّر إكمال تسجيل الدخول. حاول مرة أخرى.')
}
```

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test is added: reproducing the no-session-no-error branch requires a
live Supabase project configured for email confirmation, which is out of reach in
this repo's test setup, and there is no RN component-test harness. Verification is
the typecheck plus a code read confirming all three branches now set state.

(If a Supabase mocking layer is later introduced, add a unit test that stubs
`signInWithPassword` to resolve `{ data: { session: null, user: {...} }, error:
null }` and asserts `setError` was called.)

## Done criteria

- [ ] `handleLogin` has an `else` branch calling `setError` with the fallback
      message above.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app/(auth)/login.tsx` modified.
- [ ] `plans/README.md` status row for 005 updated.

## STOP conditions

- The `if / else if` excerpt doesn't match the live file (drift) — stop and report.

## Maintenance notes

- If email confirmation is ever enabled in Supabase, consider a more specific
  message here (e.g. "check your inbox to confirm your email") rather than the
  generic fallback.
- Reviewer: confirm the success branch (`setSession` + `router.replace`) is
  unchanged.
