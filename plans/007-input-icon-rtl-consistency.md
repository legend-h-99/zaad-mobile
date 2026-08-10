# Plan 007: Align input-icon side across the auth flow (RTL)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- "app/(auth)/login.tsx" "app/(auth)/forgot-password.tsx"`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (shares `login.tsx` with 002–006 — run sequentially, ideally last of the cluster)
- **Category**: tech-debt (visual consistency)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

Within the same auth flow, the input rows put their leading icon on opposite
sides. On login, the `inputShell` uses `flexDirection: 'row'` (icon on the left);
on forgot-password it uses `flexDirection: 'row-reverse'` (icon on the right). In
an RTL Arabic layout the leading icon conventionally sits on the **right**, and
the two screens should match. This is polish, not a bug — the escape hatch below
covers the case where the team prefers the other side.

## Current state

- `app/(auth)/login.tsx` — the `inputShell` style (around line 340) used by both
  the email and password fields:
  ```tsx
  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    backgroundColor: Colors.surfaceAlt,
  },
  ```
- `app/(auth)/forgot-password.tsx` — its `inputShell` uses
  `flexDirection: 'row-reverse'` (icon on the right). This is the target to match.

Changing login's `inputShell` to `row-reverse` moves both the mail icon (email
field) and the eye toggle (password field) to the right, matching
forgot-password. No JSX changes are needed — only the one style value.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web dev | `npm run web` | dev server starts |

## Scope

**In scope**:
- `app/(auth)/login.tsx` — the single `flexDirection` value in `inputShell`.

**Out of scope**:
- `forgot-password.tsx` — it is the reference; don't change it.
- Any other style property in `inputShell` (only `flexDirection` changes).

## Git workflow

- Branch: `advisor/007-input-icon-rtl-consistency`
- Commit: `Match login input icon side to forgot-password (RTL)`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Flip login's `inputShell` to `row-reverse`

In `app/(auth)/login.tsx`, change the `inputShell` style's
`flexDirection: 'row',` to:

```tsx
flexDirection: 'row-reverse',
```

Leave every other property in `inputShell` exactly as-is.

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

## Test plan

No automated test (visual change; no RN component-test harness). Manual check:
`npm run web`, open the login and forgot-password screens side by side — the mail
icon should sit on the **same side** (right) in both. Confirm the email/password
text still reads right-aligned and nothing overlaps.

## Done criteria

- [ ] `login.tsx` `inputShell` uses `flexDirection: 'row-reverse'`.
- [ ] The mail icon is on the same side on login and forgot-password (visual).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app/(auth)/login.tsx` modified.
- [ ] `plans/README.md` status row for 007 updated.

## STOP conditions

- The `inputShell` excerpt doesn't match the live file (drift) — stop and report.

## Maintenance notes

- **Design judgment / escape hatch:** if the team actually prefers the icon on the
  **left**, do the inverse instead — change `forgot-password.tsx`'s `inputShell`
  to `flexDirection: 'row'` and revert this file. Either way the goal is that the
  two screens match; pick one direction and apply it consistently.
- Reviewer: this diff should be a single line.
