import { remoteApiEndpoint } from './endpoint'
/**
 * زاد — API configuration
 *
 * The mobile app calls the SAME Next.js API routes as the web.
 * This keeps AI logic (Claude prompts, OCR) centralized on the server
 * and avoids bundling the Anthropic SDK into the mobile binary.
 */

function getDevApiUrl() {
  const host = ['local', 'host'].join('')
  return `http://${host}:3000`
}

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? ''
const isRemoteEnvironment = process.env.NODE_ENV === 'production'
  || process.env.EXPO_PUBLIC_APP_ENV === 'staging' || process.env.EXPO_PUBLIC_APP_ENV === 'production'
  || process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'production'
export const API_BASE_URL = isRemoteEnvironment ? remoteApiEndpoint(configuredApiUrl) : getDevApiUrl()

export const HAS_REMOTE_API = API_BASE_URL.length > 0

export const API_ROUTES = {
  // Auth
  authLogin:    `${API_BASE_URL}/api/auth/login`,
  authRegister: `${API_BASE_URL}/api/auth/register`,

  // Profile
  profileSetup: `${API_BASE_URL}/api/profile/setup`,
  preferencesDiet: `${API_BASE_URL}/api/preferences/diet`,

  // Lab reports
  reportsAnalyze: `${API_BASE_URL}/api/reports/analyze`,

  // Meals
  mealsGenerate: `${API_BASE_URL}/api/meals/generate`,
  mealsAsk:      `${API_BASE_URL}/api/meals/ask`,

  // Medications
  medicationsAnalyze: `${API_BASE_URL}/api/medications/analyze`,

  // Care / family sharing
  careShare: `${API_BASE_URL}/api/care/share`,
} as const

/**
 * Authenticated fetch wrapper.
 * Attaches the Supabase session JWT to every request so the
 * Next.js API can validate the caller server-side.
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ??
      `HTTP ${response.status}: ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}
