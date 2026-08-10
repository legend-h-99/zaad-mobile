# Plan 004: Enable keyboard submit on the login form

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/login.tsx"`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (shares `login.tsx` with 002, 003, 005–007 — run sequentially)
- **Category**: bug (UX / accessibility)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

On the login screen the email and password inputs set no `returnKeyType` /
`onSubmitEditing`, so pressing the keyboard's Return/Enter key does nothing — on
web (the deployed target) you cannot submit the form from the keyboard at all, and
on mobile the return key doesn't advance fields or log in. The sibling
`register.tsx` already does this (`onSubmitEditing={handleRegister}` on its
password field). This is both a keyboard-accessibility gap and an everyday
friction point. The fix wires the email field to advance focus to the password
field, and the password field to submit.

## Current state

`app/(auth)/login.tsx`:

- Imports (line 1): `import { useState } from 'react'` — no `useRef` yet.
- Email input (inside the email field, ~lines 128–140):
  ```tsx
  <TextInput
    value={email}
    onChangeText={setEmail}
    placeholder="name@example.com"
    placeholderTextColor={Colors.textDisabled}
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
    textContentType="emailAddress"
    textAlign="right"
    style={styles.input}
  />
  ```
- Password input (~lines 159–170):
  ```tsx
  <TextInput
    value={password}
    onChangeText={setPassword}
    placeholder="••••••••"
    placeholderTextColor={Colors.textDisabled}
    secureTextEntry={!showPassword}
    autoComplete="password"
    textContentType="password"
    textAlign="right"
    style={styles.input}
  />
  ```
- `handleLogin` is an existing `async function` in the component (~line 68).

Pattern to match: `register.tsx` uses `returnKeyType` + `onSubmitEditing` on its
inputs. `TextInput` is already imported in `login.tsx`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts |

## Scope

**In scope**:
- `app/(auth)/login.tsx` — imports, one new ref, and the two `TextInput`s.

**Out of scope**:
- `register.tsx` / `forgot-password.tsx` — they already handle submit.
- Any style or handler-logic change (do not modify `handleLogin`'s body).

## Git workflow

- Branch: `advisor/004-login-keyboard-submit`
- Commit: `Enable keyboard submit on login form`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Import `useRef` and create a password ref

Change the React import (line 1) to:

```tsx
import { useRef, useState } from 'react'
```

Inside the component, near the other `useState` hooks, add:

```tsx
const passwordRef = useRef<TextInput>(null)
```

(`TextInput` is already imported from `react-native` at the top of the file — use
that type; do not add a new import.)

### Step 2: Make the email field advance to password on Return

Add these two props to the **email** `TextInput`:

```tsx
returnKeyType="next"
onSubmitEditing={() => passwordRef.current?.focus()}
```

### Step 3: Make the password field submit on Return

Add `ref` and submit props to the **password** `TextInput`:

```tsx
ref={passwordRef}
returnKeyType="go"
onSubmitEditing={handleLogin}
```

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test (no RN component-test harness). Manual check: `npm run web`,
click the email field, type an address, press **Enter** → focus moves to the
password field; type anything, press **Enter** → `handleLogin` runs (with the demo
backend it will show an error, which is fine — it proves submit fired).

## Done criteria

- [ ] `useRef` imported; `passwordRef` created and attached to the password input.
- [ ] Email input has `returnKeyType="next"` + `onSubmitEditing` advancing focus.
- [ ] Password input has `returnKeyType="go"` + `onSubmitEditing={handleLogin}`.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app/(auth)/login.tsx` modified.
- [ ] `plans/README.md` status row for 004 updated.

## STOP conditions

- The `TextInput` excerpts don't match the live file (drift) — stop and report.
- `tsc` complains that `ref` is not assignable to `TextInput` — stop and report
  (the RN types may differ); do not switch to `any`.

## Maintenance notes

- If a "remember me" checkbox or additional field is inserted between email and
  password later, revisit the focus-advance target in Step 2.
- Reviewer: confirm `handleLogin` itself was not modified — this plan only wires
  inputs to the existing handler.
