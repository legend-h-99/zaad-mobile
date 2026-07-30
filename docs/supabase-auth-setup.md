# Supabase Auth Setup

Zaad uses Supabase Auth for email/password, Google OAuth, and password reset.

## Allowed Redirect URLs

Add these URLs in Supabase Dashboard -> Authentication -> URL Configuration:

```text
https://legend-h-99.github.io
https://legend-h-99.github.io/onboarding
https://legend-h-99.github.io/reset-password
zaad://reset-password
```

If wildcard redirects are enabled for the project, also allow:

```text
https://legend-h-99.github.io/**
zaad://**
```

## Password Reset

- The forgot-password screen sends web users to
  `https://legend-h-99.github.io/reset-password`.
- Native app users are sent to `zaad://reset-password`.
- The reset screen calls `supabase.auth.updateUser({ password })` after the
  recovery session is loaded from the link.

## Confirm Email Recommendation

Keep "Confirm email" enabled for production. Zaad handles health-related
profiles, so verified email ownership is the safer default before a user stores
personal health data.

For internal demos only, use Supabase test users or a separate demo project
instead of disabling confirmation on production.
