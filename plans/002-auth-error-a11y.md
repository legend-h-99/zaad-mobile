# Plan 002: Announce authentication errors to screen readers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/login.tsx" "app/(auth)/register.tsx" "app/(auth)/forgot-password.tsx"`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but see sequencing note — shares `login.tsx` with 003–007)
- **Category**: bug (accessibility)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

When a user submits the login/register/reset form and it fails, the app shows an
error inside a plain `View`/`Text`. Nothing tells assistive technology that new
content appeared, so a screen-reader user (VoiceOver on iOS, TalkBack on Android,
or a web screen reader) hears **nothing** — they are left thinking the button did
nothing. Marking the error container as an alert / live region makes the failure
audible. This is a health app handling personal data; blind users must be able to
tell that their login failed.

## Current state

Three screens render an error box that is not exposed to assistive tech:

- `app/(auth)/login.tsx` lines 114–121:
  ```tsx
  {error && (
    <View style={styles.errorBox}>
      <Feather name="alert-circle" size={17} color={Colors.risk.text} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )}
  ```
- `app/(auth)/register.tsx` (the `errorBanner` block):
  ```tsx
  {error && (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )}
  ```
- `app/(auth)/forgot-password.tsx` (inside the form):
  ```tsx
  {error ? <Text style={styles.error}>{error}</Text> : null}
  ```

React Native supports `accessibilityRole="alert"` and (Android)
`accessibilityLiveRegion="assertive"`; on web, `react-native-web` maps
`accessibilityRole="alert"` to `role="alert"`, which screen readers announce
automatically. Adding both covers all three platforms.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts (localhost) |

## Scope

**In scope**:
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/forgot-password.tsx`

**Out of scope**:
- Any `StyleSheet` change — this plan adds only accessibility props, no styling.
- The error *messages* themselves (wording is fine).

## Git workflow

- Branch: `advisor/002-auth-error-a11y`
- Sentence-case commit, e.g. `Announce auth errors to screen readers`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: login.tsx — mark the error box as an alert

Change the opening tag of the error `View` (line ~115) from
`<View style={styles.errorBox}>` to:

```tsx
<View
  style={styles.errorBox}
  accessible
  accessibilityRole="alert"
  accessibilityLiveRegion="assertive"
>
```

### Step 2: register.tsx — same treatment

Change `<View style={styles.errorBanner}>` to:

```tsx
<View
  style={styles.errorBanner}
  accessible
  accessibilityRole="alert"
  accessibilityLiveRegion="assertive"
>
```

### Step 3: forgot-password.tsx — same treatment

The error here is a bare `Text`. Change
`{error ? <Text style={styles.error}>{error}</Text> : null}` to:

```tsx
{error ? (
  <Text
    style={styles.error}
    accessibilityRole="alert"
    accessibilityLiveRegion="assertive"
  >
    {error}
  </Text>
) : null}
```

**Verify (after all three)**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test (no RN component-test harness in this repo). Manual check:

1. `npm run web`, open the login screen.
2. Press **دخول** with both fields empty → the error box appears.
3. In the browser console run
   `document.querySelector('[role="alert"]')?.textContent` → expect the Arabic
   error string (confirms `role="alert"` is emitted). Repeat on the register and
   forgot-password screens.

## Done criteria

- [ ] All three files have `accessibilityRole="alert"` on their error container.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] Browser console `document.querySelector('[role="alert"]')` returns the
      error element on each screen when an error is showing.
- [ ] `git status` shows only the three in-scope files modified.
- [ ] `plans/README.md` status row for 002 updated.

## STOP conditions

- The excerpts above don't match the live files (drift) — stop and report.
- `tsc` reports that `accessibilityLiveRegion` or `accessibilityRole` is not a
  valid prop — stop; the RN version may differ from what this plan assumed.

## Maintenance notes

- Any new auth-related error surface (e.g. the reset-password screen added in
  plan 008) should get the same three props — add them at creation time.
- Reviewer: verify no styling changed; this PR should be additive props only.
