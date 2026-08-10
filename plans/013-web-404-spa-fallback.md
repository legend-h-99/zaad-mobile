# Plan 013: Emit a 404.html SPA fallback in the web build

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report. When done, update this
> plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- package.json`
> package.json has not been changed by earlier plans; if it has, compare the
> "Current state" excerpt below against the live `build` script before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 010 (static web output) — DONE.
- **Category**: bug (deploy)
- **Planned at**: commit `2bd60a5`, 2026-07-30

## Why this matters

After plan 010, the web export is static: each known route (`/login`, `/register`,
`/reset-password`, …) gets its own HTML file and GitHub Pages serves it with HTTP
200. But Expo names its catch-all page `+not-found.html`, while **GitHub Pages
serves unknown paths from `404.html`** specifically. Without a `404.html`, an
unknown or mistyped URL falls through to GitHub's generic 404 page instead of the
app. Copying the app shell to `404.html` at build time restores an app-level
fallback for unknown paths (the app boots and its router shows the not-found
screen), while known routes keep their real 200 responses.

## Current state

`package.json` — the web build script:

```json
"build": "expo export --platform web --output-dir dist",
```

A build produces `dist/index.html` (app shell) and `dist/+not-found.html`, but no
`dist/404.html`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 (already installed) |
| Web build | `npm run build` | exit 0, writes `dist/` incl. `dist/404.html` |

## Scope

**In scope**:
- `package.json` — the `build` script only.

**Out of scope**:
- Any app/config/source file.
- The actual deploy/publish to the Pages repo (that is an operator step).

## Git workflow

- Branch: shared auth-fix branch (or `advisor/013-web-404-fallback`).
- Commit: `Emit 404.html SPA fallback in web build`.

## Steps

### Step 1: Append the fallback copy to the build script

Change the `build` script to copy the app shell to `404.html` after export:

```json
"build": "expo export --platform web --output-dir dist && cp dist/index.html dist/404.html",
```

### Step 2: Verify the fallback is produced

`npm run build` → exit 0, then:

```bash
ls -1 dist/404.html && diff -q dist/index.html dist/404.html && echo "404 fallback OK"
```

**Verify**: `dist/404.html` exists and is identical to `dist/index.html`
(`diff -q` prints nothing and the echo runs).

## Test plan

No automated test — build-tooling change. Verification is Step 2: the build emits
`dist/404.html` identical to the app shell.

## Done criteria

- [ ] `package.json` `build` script appends `&& cp dist/index.html dist/404.html`.
- [ ] `npm run build` exits 0 and produces `dist/404.html` == `dist/index.html`.
- [ ] `git status` shows only `package.json` modified.
- [ ] `plans/README.md` status row for 013 updated.

## STOP conditions

- The `build` script doesn't match the excerpt (drift) — stop, report.
- `npm run build` fails — stop, report (should be unaffected by appending `cp`).

## Maintenance notes

- If the project's CI/CD ever runs the build on Windows, `cp` won't exist; swap to
  a cross-platform copy (e.g. a small Node one-liner or the `cpy`/`shx` tool). On
  macOS/Linux CI this is fine.
- The deploy pipeline that publishes `dist/` to the Pages repo now carries
  `404.html` automatically — no separate manual copy needed.
- Reviewer: confirm the `expo export` portion is unchanged and only the `&& cp …`
  was appended.
