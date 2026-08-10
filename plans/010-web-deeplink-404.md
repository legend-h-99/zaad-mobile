# Plan 010: Fix web deep-link HTTP 404 (Expo web output)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- app.json`
> If output is non-empty, compare the "Current state" excerpt below against the
> live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug (deploy / correctness)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

The web build is exported in Expo's default **single-page** mode: only `/` has a
real HTML file. On GitHub Pages, any other path (e.g. `/login`, `/reset-password`)
is served by `404.html` — which happens to be a copy of the app shell, so the app
*renders*, but the HTTP status is **404**. Verified live:
`curl -s -o /dev/null -w '%{http_code}' https://legend-h-99.github.io/login` → `404`.

A 404 status on a valid route breaks search-engine indexing and link-preview
crawlers, can break embedded webviews and any non-JS client, and is simply wrong
HTTP semantics for the page a user is looking at. It also affects the password
reset link (plan 008), which deep-links into a sub-route.

This plan switches the web export to **static** output so Expo emits a real HTML
file per route, which GitHub Pages serves with HTTP 200. Because static rendering
runs each screen once at build time, there is a real risk a screen touches a
browser-only global at module scope; the plan includes a build gate and a STOP
condition for that, with two documented fallbacks.

## Current state

`app.json` — the `web` block (lines 56–58) has no `output` key, so Expo defaults
to `single`:

```json
"web": {
  "bundler": "metro",
  "favicon": "./assets/favicon.png"
},
```

Routes in `app/`: `(auth)/login`, `(auth)/register`, `(auth)/forgot-password`,
`(tabs)/*`, `onboarding`, and several stack screens. `app/index.tsx` is a
`<Redirect href="/(auth)/login" />`.

Relevant precedent already in the code (good sign for static rendering): browser
globals are accessed **guarded** — `src/store/auth.ts` and
`src/lib/supabase/client.ts` gate `globalThis.localStorage` behind
`Platform.OS === 'web'` and access it inside functions, not at module top;
`forgot-password.tsx` reads `globalThis.location` inside a handler. Static
rendering should therefore be viable, but must be verified by an actual build.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web build | `npm run build` | exit 0, writes `dist/` |
| Serve build locally (read-only) | `npx serve dist -l 5055` | serves `dist/` at localhost:5055 |

`serve` is a static file server that writes nothing; if it isn't available offline,
any static server works, or inspect the `dist/` file tree directly.

## Scope

**In scope**:
- `app.json` — add `"output": "static"` to the `web` block.

**Out of scope**:
- Screen code. If a screen turns out to be static-render-incompatible, do NOT
  start editing screens under this plan — STOP and report (see fallbacks).
- The GitHub Pages deployment pipeline itself (re-deploy is a follow-up action,
  noted below).

## Git workflow

- Branch: `advisor/010-web-deeplink-404`
- Commit: `Export web build as static (per-route HTML)`.

## Steps

### Step 0: Install

`npm install` → exit 0.

### Step 1: Set static web output

In `app.json`, add the `output` key to the `web` block:

```json
"web": {
  "bundler": "metro",
  "output": "static",
  "favicon": "./assets/favicon.png"
},
```

### Step 2: Build and confirm per-route HTML is emitted

`npm run build` → exit 0. Then inspect the output tree:

```bash
find dist -name '*.html' | sort
```

**Verify**: there are now **multiple** HTML files, including one for the login
route (e.g. `dist/login.html` or `dist/(auth)/login.html` — Expo flattens route
groups, so `dist/login.html` is expected) in addition to `dist/index.html` and
`dist/404.html`. A single `index.html` means static output did not take effect —
STOP and report.

### Step 3: Confirm routes render and return 200 when served as static files

Serve the build locally and check status codes:

```bash
npx serve dist -l 5055 &
sleep 2
for p in / /login /register /forgot-password; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5055$p)  $p"
done
kill %1 2>/dev/null
```

**Verify**: `/` and `/login` return `200` (not 404). Open `http://localhost:5055/login`
in a browser and confirm the Arabic login screen renders as before.

> Note: a plain static server maps `/login` → `dist/login.html`. GitHub Pages does
> the same. This is exactly the behavior that replaces the 404 fallback in
> production.

### Step 4: (Coordination, not code) note the redeploy

Setting static output changes the build artifact but does not redeploy it. Record
in your report that the GitHub Pages site must be re-published from the new `dist/`
for the fix to reach production. Do not perform the deploy as part of this plan
unless explicitly instructed.

## Test plan

No unit test — this is build/deploy configuration. Verification is Steps 2–3: the
build emits per-route HTML and a local static server returns HTTP 200 for `/login`
and the other auth routes while still rendering them correctly.

## Done criteria

- [ ] `app.json` web block includes `"output": "static"`.
- [ ] `npm run build` exits 0 and `find dist -name '*.html'` lists a login route
      HTML file in addition to `index.html`/`404.html`.
- [ ] Serving `dist/` returns HTTP `200` for `/` and `/login` (Step 3).
- [ ] The login screen still renders correctly from the static file (visual).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `git status` shows only `app.json` modified.
- [ ] `plans/README.md` status row for 010 updated.

## STOP conditions

- `npm run build` fails under static rendering with an error like
  `window is not defined`, `document is not defined`, `localStorage is not
  defined`, or a route-specific crash — **STOP and report the failing route and
  error**. Do not begin refactoring screens under this plan. Fallbacks to propose:
  - **(A)** Guard the offending module-scope browser access behind
    `typeof window !== 'undefined'` (a separate, scoped change/plan per screen), or
  - **(B)** Keep `output: 'single'` and instead deploy to a host with SPA rewrites
    that return 200 for all paths — the sibling repo already contains a
    `vercel.json`, and Vercel rewrites `/(.*) → /index.html` with a 200. This
    avoids the static-render risk entirely at the cost of changing host.
- Static output produces only a single `index.html` (Step 2) — STOP and report.

## Maintenance notes

- With static output, the `app/+html.tsx` from plan 001 applies to **every**
  emitted route HTML — the RTL fix keeps working across all pages.
- New routes automatically get their own HTML on the next build; no per-route
  wiring needed.
- If the app later adds routes that genuinely require runtime-only data at the
  HTML level, revisit whether `static` still suits them.
- Reviewer: confirm the build log shows multiple exported routes and that no
  screen was modified to force the build to pass (that would mean a screen had a
  static-render bug worth its own fix).
