# Plan 006: Hide the orphan "أو / or" divider when no social button renders

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/login.tsx" "app/(auth)/register.tsx"`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (shares `login.tsx` with 002–005, 007 — run sequentially)
- **Category**: bug (UX)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

The login and register screens render an "أو" ("or") divider, then an
`AppleSignInButton`. But `AppleSignInButton` returns `null` on any non-iOS
platform (`if (!isAvailable) return null`, and availability is only ever set on
iOS). On web and Android the divider therefore renders with **nothing beneath
it** — a dangling "——— أو ———" that implies a missing option. Gating the divider
and the Apple button together on iOS removes the orphan.

> **Deploy-drift note:** the currently *deployed* web build shows a Google button
> under this divider, so you won't see the orphan on the live site. This plan is
> written against **local source**, where the button is `AppleSignInButton`
> (iOS-only). Fix the local source as written; do not add a Google button.

## Current state

`app/(auth)/login.tsx` lines 183–192:

```tsx
<View style={styles.authDivider}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerText}>أو</Text>
  <View style={styles.dividerLine} />
</View>

<AppleSignInButton onError={message => setError(message || null)} />
```

`register.tsx` has the equivalent block:

```tsx
<View style={styles.authDivider}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerText}>أو</Text>
  <View style={styles.dividerLine} />
</View>

<AppleSignInButton
  mode="signUp"
  onError={message => setError(message || null)}
/>
```

`Platform` is already imported in both files (from `react-native`).
`src/components/auth/AppleSignInButton.tsx` confirms the button only ever renders
on iOS.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts |

## Scope

**In scope**:
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`

**Out of scope**:
- `AppleSignInButton.tsx` — its iOS-only behavior is correct; don't change it.
- Adding any new provider (Google, etc.).

## Git workflow

- Branch: `advisor/006-orphan-divider`
- Commit: `Hide auth divider when no social sign-in is available`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: login.tsx — gate divider + Apple button on iOS

Wrap both the divider `View` and the `AppleSignInButton` in a single
`Platform.OS === 'ios'` guard:

```tsx
{Platform.OS === 'ios' && (
  <>
    <View style={styles.authDivider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>أو</Text>
      <View style={styles.dividerLine} />
    </View>

    <AppleSignInButton onError={message => setError(message || null)} />
  </>
)}
```

### Step 2: register.tsx — same guard

```tsx
{Platform.OS === 'ios' && (
  <>
    <View style={styles.authDivider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>أو</Text>
      <View style={styles.dividerLine} />
    </View>

    <AppleSignInButton
      mode="signUp"
      onError={message => setError(message || null)}
    />
  </>
)}
```

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test (no RN component-test harness). Manual check: `npm run web`,
open login and register — the "أو" divider must be **absent** (web reports
`Platform.OS === 'web'`). In the browser console,
`[...document.querySelectorAll('*')].some(n => n.textContent === 'أو')` → expect
`false` on both screens.

## Done criteria

- [ ] Divider + Apple button are wrapped in `Platform.OS === 'ios'` on both screens.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] On web, neither screen renders the "أو" divider (console check above).
- [ ] `git status` shows only the two in-scope files modified.
- [ ] `plans/README.md` status row for 006 updated.

## STOP conditions

- The divider/button excerpts don't match the live files (drift) — stop and report.
- Product decides web/Android should offer a social provider (e.g. Google) — that
  is a different change; STOP and report rather than improvising a provider here.

## Maintenance notes

- If a web-capable provider (Google OAuth) is added later, change the guard from
  `Platform.OS === 'ios'` to a condition that's true when *any* social button will
  render — otherwise you'll re-hide a real button.
- Reviewer: confirm the guard wraps **both** the divider and the button (wrapping
  only one re-creates the orphan or hides the button).
