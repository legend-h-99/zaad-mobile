# Cloudflare Pages Deploy

This project deploys as a static Expo Web app backed by Supabase.

## Cloudflare Pages settings

Use these settings when creating the Pages project:

```text
Framework preset: None
Build command: npm run build:prod
Build output directory: dist
Root directory: /
Node version: 22.13.0
Deploy command: npx wrangler pages deploy dist --project-name=zaad-mobile-git --branch=main
```

Cloudflare Pages deploys the `dist` directory. The custom domains `zaadk.app`
and `www.zaadk.app` are attached to the `zaad-mobile-git` Pages project.
There is also a `zaad-mobile` Pages project for manual preview deploys; do not
use it for production custom-domain fixes.

If the dashboard makes deploy
command required, use `wrangler pages deploy`, not `wrangler deploy`. The plain
`wrangler deploy` command is for Workers and will fail for this static Pages
project.

Add these environment variables in Cloudflare Pages:

```text
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_VERSION=22.13.0
APP_ENV=production
```

The build emits `dist/_redirects` with this SPA fallback:

```text
/* /index.html 200
```

That keeps direct links such as `/login`, `/register`, `/reset-password`, and
`/onboarding` working on Cloudflare Pages.

## Namecheap domain setup

Recommended setup:

1. Add the domain to Cloudflare as a website.
2. Copy the two Cloudflare nameservers.
3. In Namecheap, open `Domain List -> Manage -> Nameservers`.
4. Choose `Custom DNS`.
5. Paste the Cloudflare nameservers and save.
6. Wait for Cloudflare to mark the domain active.

Then in Cloudflare Pages:

1. Open the Pages project.
2. Go to `Custom domains`.
3. Add the apex domain, for example `example.com`.
4. Add `www.example.com` if needed.

## Supabase Auth URLs

After the Cloudflare custom domain is active, update Supabase:

```text
Authentication -> URL Configuration
```

Set:

```text
Site URL: https://example.com
```

Allowed redirect URLs:

```text
https://example.com/**
https://www.example.com/**
zaad://**
```

Keep the `service_role` key server-only. Only `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` should be exposed to the web app.

## Three environments

| Environment | Cloudflare setting | Build command | Suggested domain |
|---|---|---|---|
| Development | Local only | `npm run build:dev` | `localhost` |
| Staging | Preview | `npm run build:staging` | `staging.example.com` |
| Production | Production | `npm run build:prod` | `example.com` |

Use separate Supabase projects for staging and production before storing real
health data.

## Build configuration validation

Production and staging builds use `scripts/run-expo-env.js`. Hosting environment values override local files. Example files are documentation only and are never loaded automatically. CI may provide all values without an environment file. Set `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_ANON_KEY` explicitly. Both endpoints must use remote HTTPS URLs. Localhost, local domains, IP literals, URL credentials and example domains are rejected. No credentials belong in this document.

Recovery links on installed native builds use `zaad://reset-password`; allow this exact redirect in Supabase. Only recovery fragments with both session tokens are accepted. Native-device callback verification is still required.

Consultation options and notification preferences remain local only; no external booking or notification service is configured. Daily progress records use the Saudi calendar (`Asia/Riyadh`) and the tracking screen labels this policy.
