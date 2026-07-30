/**
 * زاد — Auth store (Zustand)
 * Wraps Supabase auth session with a simple reactive store.
 * isDemoMode is persisted in SecureStore so it survives hot reloads.
 */
import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase/client'

const DEMO_KEY = 'zaad_demo_mode'
const DEMO_USER_KEY = 'zaad_demo_user_id'
const DEFAULT_DEMO_USER_ID = 'demo-hussam-2026'

// Module-level guard: the store is a singleton, so this flag is shared across
// all callers. Prevents duplicate supabase.auth.onAuthStateChange subscriptions
// when multiple screens call initialize() simultaneously (e.g. in tab navigation).
let _initialized = false

const demoStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null)
    }

    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value)
      return Promise.resolve()
    }

    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key)
      return Promise.resolve()
    }

    return SecureStore.deleteItemAsync(key)
  },
}

interface AuthState {
  session: Session | null
  user: User | null
  isLoading: boolean
  isDemoMode: boolean
  demoUserId: string

  setSession: (session: Session | null) => void
  enterDemoMode: (demoUserId?: string) => void
  clearDemoMode: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  isDemoMode: false,
  demoUserId: DEFAULT_DEMO_USER_ID,

  setSession: (session) =>
    set({ session, user: session?.user ?? null, isLoading: false }),

  enterDemoMode: (demoUserId = DEFAULT_DEMO_USER_ID) => {
    demoStorage.setItem(DEMO_KEY, '1').catch(() => {})
    demoStorage.setItem(DEMO_USER_KEY, demoUserId).catch(() => {})
    set({ isDemoMode: true, demoUserId, isLoading: false })
  },

  clearDemoMode: async () => {
    await demoStorage.removeItem(DEMO_KEY).catch(() => {})
    await demoStorage.removeItem(DEMO_USER_KEY).catch(() => {})
    set({ isDemoMode: false, demoUserId: DEFAULT_DEMO_USER_ID, isLoading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut().catch(() => {})
    await useAuthStore.getState().clearDemoMode()
    _initialized = false
    set({ session: null, user: null, isDemoMode: false, demoUserId: DEFAULT_DEMO_USER_ID })
  },

  initialize: () => {
    if (_initialized) return () => {}
    _initialized = true

    // Restore demo mode first so the guard doesn't flicker to login
    Promise.all([
      demoStorage.getItem(DEMO_KEY),
      demoStorage.getItem(DEMO_USER_KEY),
    ]).then(([demoMode, demoUserId]) => {
      if (demoMode === '1') {
        set({
          isDemoMode: true,
          demoUserId: demoUserId ?? DEFAULT_DEMO_USER_ID,
          isLoading: false,
        })
      }
    }).catch(() => {})

    // Get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false })
    }).catch(() => {
      set({ session: null, user: null, isLoading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        set({ session, user: session?.user ?? null, isLoading: false })
      },
    )

    return () => subscription.unsubscribe()
  },
}))
