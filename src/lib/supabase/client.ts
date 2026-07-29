/**
 * زاد — Supabase client for React Native (Expo)
 *
 * Uses expo-secure-store for token persistence instead of
 * localStorage (which doesn't exist in React Native).
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const raw_url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Use a valid placeholder URL when not configured — prevents crash on startup
const isValidUrl = raw_url.startsWith('http://') || raw_url.startsWith('https://')
const SUPABASE_URL = isValidUrl ? raw_url : 'https://placeholder.supabase.co'

if (!isValidUrl || !SUPABASE_ANON_KEY) {
  console.warn('[zaad] Supabase env vars not set. Add them to .env.local')
}

/**
 * SecureStore adapter for Supabase auth token persistence.
 * Keys are validated — SecureStore has a 2048-char key size limit
 * and only accepts alphanumeric + .-_ characters.
 */
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

function sanitizeKey(key: string): string {
  // Replace characters that SecureStore rejects with underscores
  return key.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255)
}

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not a web browser
  },
})
