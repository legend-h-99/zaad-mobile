# Google Auth Setup

Zaad supports Google sign-in/sign-up through Supabase Auth on web.

## Required Google Cloud Setting

In Google Cloud Console, open the OAuth 2.0 Client ID used by Supabase and add
this Authorized redirect URI. This is the callback Google must send back to,
not the GitHub Pages URL:

```text
https://cvqghvyljzxhtkjrwrvy.supabase.co/auth/v1/callback
```

The production test reached Google successfully, but Google returned
`redirect_uri_mismatch` until this URI is added.

## Required Supabase URLs

In Supabase Auth URL settings, allow the production site and onboarding return:

```text
https://legend-h-99.github.io
https://legend-h-99.github.io/onboarding
```

If Supabase supports wildcard redirects for the project, also allow:

```text
https://legend-h-99.github.io/**
```

## App Behavior

- Login with Google returns to `https://legend-h-99.github.io`.
- Sign up with Google returns to `https://legend-h-99.github.io/onboarding`.
- Email/password sign-up stores `full_name` in Supabase user metadata.
- If email confirmation is enabled, the user sees a confirmation message and
  returns to onboarding after clicking the email link.
- The app code already passes these redirect URLs from `GoogleSignInButton`.
  If Google still shows `redirect_uri_mismatch`, the remaining fix is in
  Google Cloud Console/Supabase Dashboard configuration, not in the frontend
  redirect code.
