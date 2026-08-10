# Plan 011: Handle email-confirmation in the register flow (no silent bounce)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/register.tsx"`
> Note: plan 002 (a11y) and plan 006 (divider guard) already modified this file —
> those changes are expected. The excerpts below are the `handleRegister` function
> and the imports/state region, which those plans did NOT touch. Compare against
> the CURRENT file content; on a mismatch in the specific excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none (but if executed alongside 002/006 on the same branch, run
  after them — same file)
- **Category**: bug (correctness — broken feature)
- **Planned at**: commit `2bd60a5`, 2026-07-30 (finding confirmed against live
  Supabase project `cvqghvyljzxhtkjrwrvy` on 2026-07-30)

## Why this matters

New-account registration is broken end-to-end when Supabase "Confirm email" is
enabled — which it currently is on the production project (verified: real users
sit unconfirmed, and several `auth.users` rows have no `health_profiles` row).
Flow today: `signUp()` succeeds but returns **no session** (confirmation pending);
`register.tsx` immediately `router.replace('/onboarding')`; the root guard sees
`isAuthenticated === false` and bounces the user to `/login`. The account exists
but is inactive, the user is given **no hint to check their email**, and because
profiles are only created during onboarding (there is no DB trigger), **no
`health_profiles` row is ever written**. This fix makes the flow correct under
BOTH settings:
- confirmation **off / auto** (`data.session` present) → continue to onboarding as
  before;
- confirmation **on** (`data.session` null) → show a "check your email" state
  instead of routing into a screen the user can't reach.

It does not change the Supabase setting (that is a separate operator decision) and
needs no backend change.

## Current state

`app/(auth)/register.tsx`:

- Imports (top): `import { useState } from 'react'`.
- State region inside the component:
  ```tsx
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  ```
- `handleRegister` (the relevant tail):
  ```tsx
  const { error: authError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: name.trim() },
    },
  })

  if (authError) {
    setError(
      authError.message.includes('already registered')
        ? 'هذا البريد الإلكتروني مسجل مسبقاً'
        : 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مجدداً'
    )
    setLoading(false)
    return
  }

  // Redirect to onboarding to complete health profile
  router.replace('/onboarding')
  ```
- The component returns a `KeyboardAvoidingView` > `ScrollView` with a header and a
  form card. `ZaadButton`, `Feather`, `useRouter`, `useSafeAreaInsets`,
  `Colors/Typography/Spacing/Radius`, and `supabase` are already imported.

Reusable pattern: `forgot-password.tsx` has a "sent" success state (an icon, a
title, a subtitle showing the email, and a `ZaadButton` back to login) — mirror
its structure/tone.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |

## Scope

**In scope**:
- `app/(auth)/register.tsx` — add state, branch `handleRegister` on the session,
  add an "awaiting confirmation" render.

**Out of scope**:
- `app/_layout.tsx` guard logic.
- Deep-link handling of the confirmation email link (a confirmed user returning to
  the app then logging in is handled by the existing login flow). Routing a
  confirmed-but-profile-less user into onboarding is a **separate** follow-up (see
  Maintenance notes) — do not attempt it here.
- Any Supabase dashboard/setting change.

## Git workflow

- Branch: `advisor/011-register-email-confirmation` (or the shared auth-fix branch
  if batching). Commit: `Handle email-confirmation in register flow`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Add an `awaitingConfirmation` state flag

Add next to the other `useState` hooks:

```tsx
const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
```

### Step 2: Branch `handleRegister` on the returned session

Capture `data` and branch instead of unconditionally routing:

```tsx
const { data, error: authError } = await supabase.auth.signUp({
  email: email.trim().toLowerCase(),
  password,
  options: {
    data: { full_name: name.trim() },
  },
})

if (authError) {
  setError(
    authError.message.includes('already registered')
      ? 'هذا البريد الإلكتروني مسجل مسبقاً'
      : 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مجدداً'
  )
  setLoading(false)
  return
}

if (data.session) {
  // Email confirmation disabled / auto-confirmed — session ready, continue.
  router.replace('/onboarding')
} else {
  // Email confirmation required — account created but not yet active.
  setLoading(false)
  setAwaitingConfirmation(true)
}
```

### Step 3: Render a "check your email" state

Immediately before the component's main `return (` statement, add an early return
shown when `awaitingConfirmation` is true. Use existing imports and theme tokens;
keep styles inline-simple or reuse the header/card styles already in this file.
Minimum required content: a mail icon, a title "تحقق من بريدك", a line telling the
user a confirmation link was sent to `{email.trim().toLowerCase()}`, and a
`ZaadButton` that navigates back to login. Example:

```tsx
if (awaitingConfirmation) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.primaryLight,
        }}
      >
        <Feather name="mail" size={28} color={Colors.primary} />
      </View>
      <Text
        style={{
          fontSize: Typography.size['2xl'],
          fontFamily: Typography.fontFamily.bold,
          color: Colors.textPrimary,
          textAlign: 'center',
        }}
      >
        تحقق من بريدك
      </Text>
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={{
          maxWidth: 320,
          fontSize: Typography.size.sm,
          lineHeight: Typography.size.sm * 1.7,
          fontFamily: Typography.fontFamily.regular,
          color: Colors.textMuted,
          textAlign: 'center',
        }}
      >
        أرسلنا رابط تفعيل إلى {email.trim().toLowerCase()}. افتح الرابط لتأكيد حسابك ثم
        سجّل الدخول لإكمال ملفك الصحي.
      </Text>
      <ZaadButton
        labelAr="العودة لتسجيل الدخول"
        onPress={() => router.replace('/(auth)/login')}
      />
    </View>
  )
}
```

(If any referenced token — `Typography.size['2xl']`, `Colors.primaryLight`,
`Colors.textPrimary` — does not exist, STOP and report; they are all used
elsewhere in this file or in `login.tsx`, so they should resolve.)

**Verify**: `npx tsc --noEmit` → exit 0.

## Test plan

No automated test (no RN component-test harness; the branch depends on live
Supabase behavior). Verification is `tsc` plus a code read confirming: (a)
`handleRegister` routes to onboarding only when `data.session` is truthy, and
otherwise sets `awaitingConfirmation`; (b) the early-return confirmation screen
renders when `awaitingConfirmation` is true.

Optional live check (requires the app running against Supabase with "Confirm
email" ON): register a fresh email → the "تحقق من بريدك" screen appears instead of
a bounce to login. With confirmation OFF, registration proceeds to onboarding.

## Done criteria

- [ ] `awaitingConfirmation` state added.
- [ ] `handleRegister` captures `data` and routes to `/onboarding` only when
      `data.session` is present; otherwise shows the confirmation state.
- [ ] An early-return "check your email" screen renders on `awaitingConfirmation`.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app/(auth)/register.tsx` modified.
- [ ] `plans/README.md` status row for 011 updated.

## STOP conditions

- The `handleRegister` excerpt doesn't match the current file (drift) — stop, report.
- A referenced theme token doesn't exist — stop, report (do not substitute).

## Maintenance notes

- **Operator decision (not code):** if the product wants frictionless signup,
  disable "Confirm email" in Supabase → Authentication → Providers → Email; then
  `data.session` is present and users go straight to onboarding. This plan works
  either way.
- **Related follow-up (separate plan):** a user who confirms their email and logs
  in still lands on `/(tabs)` even with no `health_profiles` row, because the root
  guard only checks authenticated-vs-not. Consider routing authenticated users
  with no profile to `/onboarding` (guard against redirect loops). Not in scope
  here.
- Reviewer: confirm the success path still reaches onboarding when a session is
  returned; the change must be purely additive around the no-session case.
