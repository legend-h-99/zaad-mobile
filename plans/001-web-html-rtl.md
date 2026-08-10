# Plan 001: Serve the web build's root HTML as Arabic RTL

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- app.json app/+html.tsx`
> If output is non-empty, compare the "Current state" excerpts below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/010-web-deeplink-404.md — **hard dependency**. `+html.tsx`
  is only honored when `web.output` is `static` (or `server`); plan 010 sets that.
  Under the default SPA output this fix does nothing (see "Current state").
- **Category**: bug (accessibility / i18n)
- **Planned at**: commit `2bd60a5`, 2026-07-30
- **Revised**: 2026-07-30 — added the 010 dependency after an execution attempt
  proved `+html.tsx` is ignored under default (SPA) web output.

## Why this matters

Zaad is an Arabic, right-to-left, health app. The React Native runtime forces RTL
(`I18nManager.forceRTL(true)` in `app/_layout.tsx`), but that only affects the
JS-rendered tree. The **root HTML document** the web export serves is still
`<html lang="en">` with no `dir` attribute (verified live: the deployed page
reports `lang:"en", dir:""`). Consequences: screen readers announce Arabic text
with an English language profile (wrong pronunciation/voice), and before the JS
bundle boots the page lays out left-to-right. Setting `lang="ar" dir="rtl"` on the
document is the single highest-leverage accessibility fix for this app and is a
one-file change.

## Current state

- `app.json` — Expo config. The `web` block (lines 56–58) customizes only the
  bundler and favicon; there is no HTML customization hook there:
  ```json
  "web": {
    "bundler": "metro",
    "favicon": "./assets/favicon.png"
  },
  ```
- **There is no `app/+html.tsx`** (confirmed: `find app -maxdepth 1 -name "+html*"`
  returns nothing). `app/+html.tsx` is the documented Expo Router mechanism to
  customize the root HTML for **web only** (it is never used on native).
- **CRITICAL (verified during an execution attempt):** `+html.tsx` is only
  rendered when the web export runs the server-rendering path, which Expo enables
  **only when `web.output` is `"static"` or `"server"`**. In the installed CLI,
  `node_modules/expo/node_modules/@expo/cli/build/src/export/exportApp.js:142-145`
  computes `useServerRendering = ['static','server'].includes(exp.web?.output ?? '')`;
  when false, `expo export --platform web` writes `index.html` from a hardcoded
  template (`createTemplateHtmlFromExpoConfigAsync` in
  `start/server/webTemplate.js`) that **always emits `<html lang="en">` and
  ignores `+html.tsx`**. This repo's `app.json` has no `web.output`, so it
  defaults to SPA (`single`). **Therefore plan 010 (which sets
  `web.output: "static"`) must land first, or this fix is inert.**
- **Fallback caveat:** if plan 010 cannot use static output and falls back to
  Vercel SPA rewrites (still `output: single`), `+html.tsx` remains ignored — this
  plan's approach does not apply, and the RTL document attributes would need a
  different mechanism (e.g. a small post-build script that rewrites the `<html>`
  tag in `dist/index.html`). In that case, STOP and report rather than forcing it.
- The current served `<head>` (from the deployed `index.html`) includes an
  `expo-reset` style block and a viewport meta. Your new file must preserve
  equivalent behavior via `ScrollViewStyleReset` so scrolling is not broken.

Convention note: this repo uses 2-space indentation, no semicolons, single
quotes (see any file under `app/` or `src/`). Match it.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0, creates `node_modules/` |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web build | `npm run build` | exit 0, writes `dist/` (gitignored) |

## Scope

**In scope** (only files you may modify/create):
- `app/+html.tsx` (create)

**Out of scope** (do NOT touch):
- `app/_layout.tsx` — the runtime `forceRTL` there is correct; leave it.
- `app.json` — no change needed for this fix.
- Any screen component.

## Git workflow

- Branch: `advisor/001-web-html-rtl`
- Commit style matches this repo's history (sentence-case subject, e.g.
  `Serve web root HTML as Arabic RTL`). Do not push or open a PR unless asked.

## Steps

### Step 0: Confirm plan 010 is done, then install

**Prerequisite:** `plans/010-web-deeplink-404.md` must be DONE — i.e. `app.json`'s
`web` block already contains `"output": "static"`. Verify:
`grep -n '"output"' app.json` → shows `"output": "static"`. If it does not, STOP:
plan 010 must land first (this fix is inert without it).

Then `npm install` → exit 0. (Before this, typecheck cannot run.)

### Step 1: Create `app/+html.tsx`

Create the file with exactly this content:

```tsx
import { ScrollViewStyleReset } from 'expo-router/html'
import { type PropsWithChildren } from 'react'

/**
 * Web-only root HTML wrapper (Expo Router static rendering).
 * Sets the document language/direction to Arabic RTL to match the app.
 * This file has no effect on native (iOS/Android) builds.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Verify**: `npx tsc --noEmit` → exit 0, no errors.

### Step 2: Confirm the built HTML is RTL Arabic

`npm run build` then inspect the generated root document:

```bash
grep -o '<html[^>]*>' dist/index.html
```

**Verify**: output contains `lang="ar"` and `dir="rtl"` (e.g.
`<html lang="ar" dir="rtl">`). If `dist/index.html` doesn't exist, check the build
log for the actual output path (`dist/` is the configured `--output-dir`).

## Test plan

No automated test — this is a static-HTML attribute change and the repo has no
web/DOM test harness. Verification is the `grep` in Step 2 plus, optionally:
`npm run web`, open the local URL, run in the browser console
`document.documentElement.getAttribute('dir')` → expect `"rtl"` and
`document.documentElement.lang` → expect `"ar"`.

## Done criteria

- [ ] `app/+html.tsx` exists with the content above.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` exits 0 and `dist/index.html` `<html>` tag has
      `lang="ar"` and `dir="rtl"`.
- [ ] `git status` shows only `app/+html.tsx` added (no other files modified).
- [ ] `plans/README.md` status row for 001 updated.

## STOP conditions

- `app/+html.tsx` already exists (someone added it since this plan was written) —
  stop and report; do not overwrite.
- `npm run build` fails with an error mentioning `+html`, `ScrollViewStyleReset`,
  or static rendering — stop and report the full error.
- After the change, `dist/index.html` still shows `lang="en"` — this means the
  server-rendering path did not run, almost always because `web.output` is not
  `static` (plan 010 not applied). Stop and report; do not try to patch the
  hardcoded template.

## Maintenance notes

- If a future change sets `web.output` to `static` (see plan 010), this same
  `+html.tsx` wrapper applies to every per-route HTML file — the RTL fix keeps
  working, no revisit needed.
- Reviewer: confirm the file exports a default component named `Root` and that
  `ScrollViewStyleReset` is present (dropping it re-introduces a body-scroll bug).
- Deferred: per-page `<title>`/meta localization is out of scope here.
