# Plan 008: Complete the password-reset flow (new screen + web token handling)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/_layout.tsx" "app/(auth)/forgot-password.tsx" "src/lib/supabase/client.ts"`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: 010 is a soft dependency (it makes the reset URL return HTTP 200
  instead of 404; the flow still works without it via the SPA fallback). No hard
  code dependency.
- **Category**: bug (correctness — broken feature)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

"نسيت كلمة المرور؟" is currently a dead end. `forgot-password.tsx` sends a Supabase
reset email, but:
1. There is **no screen** anywhere in the app to enter a new password — the routes
   are only `login`, `register`, `forgot-password`.
2. The email link's `redirectTo` points at `/login`, and the web Supabase client
   is created with `detectSessionInUrl: false`, so the recovery token in the
   return URL is never exchanged for a session on web.

So a user can request a reset but can never actually complete one on the web build.
This plan adds the missing `reset-password` screen, points the email link at it,
and lets the web client process the recovery token.

## Current state

- `app/(auth)/_layout.tsx` — registers the auth screens:
  ```tsx
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="login"    />
    <Stack.Screen name="register" />
    <Stack.Screen name="forgot-password" />
  </Stack>
  ```
- `app/(auth)/forgot-password.tsx` lines 33–40 — builds the redirect and sends:
  ```tsx
  const redirectTo = Platform.OS === 'web'
    ? `${globalThis.location?.origin ?? ''}/login`
    : 'zaad://login'
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo },
  )
  ```
- `src/lib/supabase/client.ts` lines 71–77 — the auth config:
  ```tsx
  export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Not a web browser
    },
  })
  ```
- **No `app/(auth)/reset-password.tsx` exists.**
- Reusable pieces to match: `ZaadButton` (`src/components/ui/ZaadButton.tsx`,
  props `labelAr`, `onPress`, `loading`, `variant`, `size`), the theme tokens
  `Colors, Radius, Spacing, Typography` from `src/constants/theme`, and the visual
  structure of `forgot-password.tsx` (copy its layout/styles as the template).

### External prerequisite (cannot be done in code)

Supabase only redirects to URLs on its **allow-list**. Before the email link can
land on the new screen, these must be added in the Supabase dashboard →
**Authentication → URL Configuration → Redirect URLs**:
- `https://legend-h-99.github.io/reset-password`
- `zaad://reset-password`

If you do not have dashboard access, you can still build and unit-verify the
screen, but the end-to-end email test (Step 5) will fail at the redirect. In that
case, complete Steps 1–4, mark the plan **BLOCKED** with reason "awaiting Supabase
redirect-URL allow-list", and report.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts |

## Scope

**In scope**:
- `app/(auth)/reset-password.tsx` (create)
- `app/(auth)/_layout.tsx` (register the route)
- `app/(auth)/forgot-password.tsx` (change `redirectTo` target)
- `src/lib/supabase/client.ts` (enable URL detection on web only)

**Out of scope**:
- `login.tsx`, `register.tsx` content.
- The `ExpoSecureStoreAdapter` and `sanitizeKey` in the client — leave as-is.
- Any change to native (iOS/Android) auth behavior beyond the deep-link target.

## Git workflow

- Branch: `advisor/008-password-reset-flow`
- Commit per logical unit (screen, route, redirect, client). Sentence-case
  subjects, e.g. `Add reset-password screen`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Enable recovery-token detection on web only

In `src/lib/supabase/client.ts`, change the `detectSessionInUrl` line so it is
`true` on web (where the recovery token arrives in the URL) and `false` on native:

```tsx
detectSessionInUrl: Platform.OS === 'web', // web: exchange recovery/OAuth token in URL
```

`Platform` is already imported at the top of this file. This lets supabase-js
automatically exchange the `#access_token…&type=recovery` fragment for a session
when the reset link opens the web app.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Create `app/(auth)/reset-password.tsx`

Create the screen. It assumes Supabase has established a recovery session (Step 1
handles that on web; on native the deep link + `onAuthStateChange` PASSWORD_RECOVERY
event does). It collects a new password, calls
`supabase.auth.updateUser({ password })`, and on success routes to login. Use this
implementation (styling mirrors `forgot-password.tsx`):

```tsx
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ZaadButton } from '../../src/components/ui/ZaadButton'
import { Colors, Radius, Spacing, Typography } from '../../src/constants/theme'
import { supabase } from '../../src/lib/supabase/client'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit() {
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError('تعذّر تحديث كلمة المرور. افتح الرابط من بريدك مرة أخرى.')
      return
    }
    setDone(true)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + Spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.icon}>
          <Feather name={done ? 'check-circle' : 'lock'} size={28} color={Colors.burgundy} />
        </View>
        <Text style={styles.title}>{done ? 'تم التحديث' : 'كلمة مرور جديدة'}</Text>
        <Text style={styles.subtitle}>
          {done
            ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'اختر كلمة مرور جديدة لحسابك.'}
        </Text>

        {!done ? (
          <View style={styles.form}>
            {error ? (
              <Text
                style={styles.error}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                {error}
              </Text>
            ) : null}
            <Text style={styles.label}>كلمة المرور الجديدة</Text>
            <View style={styles.inputShell}>
              <Feather name="lock" size={18} color={Colors.textSubtle} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="8 أحرف على الأقل"
                placeholderTextColor={Colors.textDisabled}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                textAlign="right"
                style={styles.input}
              />
            </View>
            <Text style={styles.label}>تأكيد كلمة المرور</Text>
            <View style={styles.inputShell}>
              <Feather name="lock" size={18} color={Colors.textSubtle} />
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="أعد كتابة كلمة المرور"
                placeholderTextColor={Colors.textDisabled}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                textAlign="right"
                style={styles.input}
                onSubmitEditing={submit}
              />
            </View>
            <ZaadButton labelAr="حفظ كلمة المرور" onPress={submit} loading={loading} />
          </View>
        ) : (
          <View style={styles.form}>
            <ZaadButton
              labelAr="تسجيل الدخول"
              onPress={() => router.replace('/(auth)/login')}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },
  icon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.burgundy,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 330,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  inputShell: {
    minHeight: 54,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  error: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.risk.text,
    textAlign: 'right',
  },
})
```

**Verify**: `npx tsc --noEmit` → exit 0. If any theme token (e.g.
`Spacing['4xl']`, `Colors.lime`, `Typography.size['2xl']`) does not exist, STOP
and report — do not invent replacements. (These are all used by
`forgot-password.tsx`, so they should resolve.)

### Step 3: Register the route

In `app/(auth)/_layout.tsx`, add the screen to the stack:

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="login"    />
  <Stack.Screen name="register" />
  <Stack.Screen name="forgot-password" />
  <Stack.Screen name="reset-password" />
</Stack>
```

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 4: Point the reset email at the new screen

In `app/(auth)/forgot-password.tsx`, change the `redirectTo` (lines 34–36) to
target `reset-password`:

```tsx
const redirectTo = Platform.OS === 'web'
  ? `${globalThis.location?.origin ?? ''}/reset-password`
  : 'zaad://reset-password'
```

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 5: End-to-end check (requires the external prerequisite)

Only possible once the redirect URLs are allow-listed (see "External
prerequisite"). With a real Supabase account:
1. `npm run web`, go to forgot-password, submit a real email → success state.
2. Open the email link → it should load the app at `/reset-password` with an
   active recovery session.
3. Enter a new 8+ char password twice → "تم التحديث" success state.
4. Log in with the new password → reaches `/(tabs)`.

If the prerequisite isn't met, skip Step 5, mark the plan BLOCKED as described,
and report.

## Test plan

No automated test: the flow depends on live Supabase auth and email delivery, and
the repo has no RN component-test harness or Supabase mock. Verification is the
typecheck gates in Steps 1–4 plus the manual E2E in Step 5 when unblocked.

Deferred: if a Supabase mock is later added, unit-test `submit()` for the
`< 8 chars`, `mismatch`, and `updateUser` error branches.

## Done criteria

- [ ] `src/lib/supabase/client.ts` sets `detectSessionInUrl: Platform.OS === 'web'`.
- [ ] `app/(auth)/reset-password.tsx` exists and typechecks.
- [ ] `reset-password` is registered in `app/(auth)/_layout.tsx`.
- [ ] `forgot-password.tsx` `redirectTo` targets `/reset-password` (web) and
      `zaad://reset-password` (native).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only the four in-scope files changed/created.
- [ ] Step 5 passes **or** the plan is marked BLOCKED with the redirect-URL reason.
- [ ] `plans/README.md` status row for 008 updated.

## STOP conditions

- Any "Current state" excerpt doesn't match the live code (drift) — stop, report.
- A theme token referenced by the new screen doesn't exist — stop, report (do not
  substitute a different token or a literal).
- Flipping `detectSessionInUrl` on web breaks existing web login/session restore
  in an obvious way (e.g. session no longer persists) — stop and report; the
  manual token-parsing alternative would then be considered instead.

## Maintenance notes

- `detectSessionInUrl: true` on web also governs OAuth-in-URL flows. If a web
  social login is added later, this setting is already correct for it.
- After plan 010 (web output/404), the `/reset-password` URL returns HTTP 200
  instead of 404 — no code change needed here, but re-test the email link then.
- Reviewer: scrutinize the `detectSessionInUrl` change and confirm native deep
  linking (`zaad://reset-password`) is registered by the app scheme (`scheme:
  "zaad"` in `app.json`, already present).
