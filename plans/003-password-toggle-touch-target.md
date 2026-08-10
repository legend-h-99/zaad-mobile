# Plan 003: Enlarge the password show/hide touch target to 44pt

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
- **Depends on**: none (shares `login.tsx` with 002, 004–007 — run sequentially)
- **Category**: bug (accessibility)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

The show/hide-password toggle on the login screen is an 18px eye icon wrapped in a
`Pressable` with no minimum size and no `hitSlop`. Its tappable area is ~18–24pt —
below the 44pt minimum this app enforces everywhere else (the shared `ZaadButton`
uses `MIN_TOUCH_TARGET = 44`, defined in `src/constants/theme.ts:147`). Small
targets are a WCAG 2.5.5 / Apple HIG failure and disproportionately affect users
with motor impairments. The fix extends the tap area without changing the visual
layout.

## Current state

`app/(auth)/login.tsx` lines 146–161 — the password field's reveal toggle:

```tsx
<Pressable
  onPress={() => setShowPassword(value => !value)}
  accessibilityRole="button"
  accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
>
  <Feather
    name={showPassword ? 'eye-off' : 'eye'}
    size={18}
    color={Colors.textSubtle}
  />
</Pressable>
```

The accessibility label is already correct — only the hit area is too small.
`hitSlop` extends the touch region **without affecting layout**, so it will not
disturb the input row (`inputShell` has `minHeight: 54`). 18px icon + 13pt on each
side ≈ 44pt.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts |

## Scope

**In scope**:
- `app/(auth)/login.tsx` — the `Pressable` above, only.

**Out of scope**:
- `app/(auth)/register.tsx` — it has **no** reveal toggle at all. Adding one is a
  separate UX change; do NOT add it here (noted as deferred follow-up below).
- Any `StyleSheet` entry.

## Git workflow

- Branch: `advisor/003-password-toggle-touch-target`
- Commit: `Enlarge password reveal touch target to 44pt`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Add `hitSlop` to the reveal `Pressable`

Add a `hitSlop` prop to the `Pressable` (keep everything else identical):

```tsx
<Pressable
  onPress={() => setShowPassword(value => !value)}
  hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
  accessibilityRole="button"
  accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
>
```

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test (no RN component-test harness). Manual check: `npm run web`,
open login, and tap the empty area just around the eye icon (not directly on it) —
the password masking should toggle. On a touch device the whole ~44pt zone is
now active.

## Done criteria

- [ ] The reveal `Pressable` in `login.tsx` has
      `hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}`.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app/(auth)/login.tsx` modified.
- [ ] `plans/README.md` status row for 003 updated.

## STOP conditions

- The `Pressable` excerpt doesn't match the live file (drift) — stop and report.

## Maintenance notes

- **Deferred follow-up (not this plan):** `register.tsx` has no password-reveal
  toggle. If product wants parity, add a toggle there mirroring this one — and
  give it the same `hitSlop` from day one.
- Reviewer: confirm no layout shift — `hitSlop` must not be replaced with padding
  or a fixed width/height, which *would* move the icon.
