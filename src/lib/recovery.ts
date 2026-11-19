export const NATIVE_RECOVERY_REDIRECT = 'zaad://reset-password'

// Compare protocol, authority and path; custom-scheme URL.origin is always "null".
export function recoveryTokens(input: string): { access_token: string; refresh_token: string } | null {
  try {
    const url = new URL(input)
    const allowed = new URL(NATIVE_RECOVERY_REDIRECT)
    if (url.protocol !== allowed.protocol || url.host !== allowed.host || url.pathname !== allowed.pathname
      || url.username || url.password || url.search) return null
    const params = new URLSearchParams(url.hash.slice(1))
    if (params.get('type') !== 'recovery') return null
    for (const key of ['type', 'access_token', 'refresh_token']) if (params.getAll(key).length !== 1) return null
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (!access_token?.trim() || !refresh_token?.trim()) return null
    return { access_token, refresh_token }
  } catch { return null }
}
