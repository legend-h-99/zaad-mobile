# Plan 012: Make the Supabase storage adapter static-render-safe

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in "STOP conditions" occurs, stop and report — do not improvise.
> When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 2bd60a5..HEAD -- src/lib/supabase/client.ts`
> Note: plan 008 already changed one line in this file (`detectSessionInUrl`).
> That is expected. The excerpt below is the `ExpoSecureStoreAdapter` object,
> which plan 008 did NOT touch. Compare against the CURRENT file content.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (touches the auth client's storage layer used on every platform)
- **Depends on**: none. **Unblocks**: 010, then 001.
- **Category**: bug (build / correctness)
- **Planned at**: commit `2bd60a5`, 2026-07-30 (blocker reproduced twice via
  `expo export` with `web.output: static`)

## Why this matters

Plan 010 switches the web export to `output: "static"` so every route gets real
HTML served with HTTP 200 (fixing the current 404-status on `/login` etc.). With
static output, `expo export` **server-renders every route in Node at build time**.
That crashes today because `src/lib/supabase/client.ts` creates the Supabase client
at module scope, and Supabase eagerly runs session recovery on init, which calls
this file's `ExpoSecureStoreAdapter`. On web the adapter does
`globalThis.localStorage?.getItem(key)`. During the Node render pass a *stub*
`globalThis.localStorage` exists but its methods are **not functions**, so the
optional chain doesn't protect it and the build dies with:

```
TypeError: globalThis.localStorage?.getItem is not a function
```

The fix is small and safe: before calling a `localStorage` method, check it is
actually a function. In a real browser it always is (behavior unchanged); during
static render the adapter safely no-ops (returns no stored session), so the page
renders as the logged-out shell and hydrates normally on the client. This unblocks
010 and 001 without changing runtime behavior on web, iOS, or Android.

## Current state

`src/lib/supabase/client.ts` — the storage adapter (the three web branches use a
bare optional chain that does NOT guard against a non-function method):

```tsx
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null
    }

    try {
      return await SecureStore.getItemAsync(sanitizeKey(key))
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value)
      return
    }

    try {
      await SecureStore.setItemAsync(sanitizeKey(key), value)
    } catch (e) {
      console.error('[zaad] SecureStore setItem error', e)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key)
      return
    }

    try {
      await SecureStore.deleteItemAsync(sanitizeKey(key))
    } catch {
      // ignore
    }
  },
}
```

`Platform` is already imported. The native branches (`SecureStore`) are correct
and must stay unchanged.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install` | exit 0 (already installed in this worktree) |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Web build | `npm run build` | exit 0 (verified in plan 010's retry) |

## Scope

**In scope**:
- `src/lib/supabase/client.ts` — the three web branches of `ExpoSecureStoreAdapter`.

**Out of scope**:
- The native `SecureStore` branches.
- `createSupabaseClient(...)` options (leave `persistSession`, `autoRefreshToken`,
  `detectSessionInUrl` as they are).
- `app.json` (that's plan 010).
- The `demoStorage` object in `src/store/auth.ts` (not in the static-render init
  path — auth store init runs from a React effect, not at build time).

## Git workflow

- Branch: shared auth-fix branch (or `advisor/012-supabase-static-safe`).
- Commit: `Guard web storage adapter for static rendering`.

## Steps

### Step 0: Install (skip if already installed)

`npm install` → exit 0.

### Step 1: Add a functional-`localStorage` guard to each web branch

Replace the three web branches so each checks the method is callable first. A
small local helper keeps it DRY. Change the adapter to:

```tsx
const webLocalStorage = (): Storage | null => {
  const ls = globalThis.localStorage
  // During Expo's Node-side static render a stub `localStorage` exists but its
  // methods are not functions — treat that as "no storage available".
  return typeof ls?.getItem === 'function' ? ls : null
}

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return webLocalStorage()?.getItem(key) ?? null
    }

    try {
      return await SecureStore.getItemAsync(sanitizeKey(key))
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      webLocalStorage()?.setItem(key, value)
      return
    }

    try {
      await SecureStore.setItemAsync(sanitizeKey(key), value)
    } catch (e) {
      console.error('[zaad] SecureStore setItem error', e)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      webLocalStorage()?.removeItem(key)
      return
    }

    try {
      await SecureStore.deleteItemAsync(sanitizeKey(key))
    } catch {
      // ignore
    }
  },
}
```

Keep the native branches exactly as they were.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Prove the static build no longer crashes here

This step temporarily engages static output only to confirm the adapter fix, then
reverts (plan 010 owns the real `app.json` change). In `app.json`, temporarily add
`"output": "static"` to the `web` block, run `npm run build`, then check the
result and REVERT `app.json`:

```bash
# after temporarily adding "output": "static" to app.json web block:
npm run build; echo "build exit=$?"
find dist -name '*.html' | sort | head
git checkout -- app.json   # revert — plan 010 will set this for real
rm -rf dist
```

**Verify**: the build **no longer** fails with
`globalThis.localStorage?.getItem is not a function`. Ideally it exits 0 and lists
per-route HTML. If it now fails on a DIFFERENT module-scope browser error (e.g. a
specific screen using `window`/`document` at import time), that is a NEW finding —
STOP and report the exact error and file (do not fix more screens under this
plan). If it exits 0, the adapter fix is sufficient; proceed.

> Note: this step's `app.json` edit is a throwaway probe and MUST be reverted
> before committing. Commit only `src/lib/supabase/client.ts`.

### Step 3: Commit

Commit only `src/lib/supabase/client.ts` with message
`Guard web storage adapter for static rendering`. Confirm `git status --porcelain`
shows nothing else staged/modified (app.json reverted, dist removed/gitignored).

## Test plan

No automated test (no browser/DOM harness, and the fix targets a build-time render
path). Verification is: (1) `tsc` exit 0; (2) the static build in Step 2 gets past
the `localStorage … is not a function` crash. Runtime behavior on real web is
unchanged because a browser's `localStorage.getItem` is always a function, so
`webLocalStorage()` returns the real object.

## Done criteria

- [ ] `client.ts` guards all three web branches via a functional-`localStorage`
      check (real browsers behave exactly as before).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] A temporary `output: static` build no longer crashes on the `localStorage`
      error (Step 2); `app.json` reverted afterward.
- [ ] `git status` shows only `src/lib/supabase/client.ts` committed.
- [ ] `plans/README.md` status row for 012 updated, and 010 unblocked.

## STOP conditions

- The `ExpoSecureStoreAdapter` excerpt doesn't match the current file (drift) —
  stop, report.
- The static build in Step 2 now fails on a DIFFERENT browser-global error in some
  screen/module — stop and report the file+error (this is the whack-a-mole risk;
  the reviewer will decide whether to keep going down the static path or switch to
  the Vercel fallback). Do NOT start editing screens.
- `npm install` or `tsc` reports `Storage` is not a known type — replace the
  `Storage` return annotation with `typeof globalThis.localStorage` and retry; if
  it still fails, stop and report.

## Maintenance notes

- This is the enabling change for plan 010 (`web.output: static`) and, through it,
  plan 001 (`+html.tsx` RTL). Execute 010 then 001 immediately after this.
- If Step 2 uncovers additional static-render-unsafe modules, the pragmatic
  alternative is the Vercel single-output + rewrites path (see `plans/README.md`
  dependency notes) — that needs no static rendering at all.
- Reviewer: confirm the native `SecureStore` branches are byte-for-byte unchanged
  and that no client option (`persistSession` etc.) was altered.
