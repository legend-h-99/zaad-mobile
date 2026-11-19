/**
 * زاد — Auth store (Zustand)
 * Wraps Supabase auth session with a simple reactive store.
 */
import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase/client'
import { clearAccountQueries } from '../lib/query-client'
import { setProfileIdentity } from './profile'

const DEMO_KEY = 'zaad_demo_mode'
const DEMO_USER_KEY = 'zaad_demo_user_id'
const DEFAULT_DEMO_USER_ID = ''

// Module-level guard: the store is a singleton, so this flag is shared across
// all callers. Prevents duplicate supabase.auth.onAuthStateChange subscriptions
// when multiple screens call initialize() simultaneously (e.g. in tab navigation).
let _initialized = false
let sessionRevision = 0

const demoStorage = {
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
  isRecovering: boolean
  clearRecovery: () => void
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
  isRecovering: false,
  clearRecovery: () => set({ isRecovering: false }),
  user: null,
  isLoading: true,
  isDemoMode: false,
  demoUserId: DEFAULT_DEMO_USER_ID,

  setSession: (session) => {
    sessionRevision++
    if (useAuthStore.getState().user?.id !== session?.user.id) {
      clearAccountQueries()
      setProfileIdentity(session?.user.id ?? null)
    }
    set({ session, user: session?.user ?? null, isLoading: false, ...(!session ? { isRecovering: false } : {}) })
  },

  enterDemoMode: () => {
    demoStorage.removeItem(DEMO_KEY).catch(() => {})
    demoStorage.removeItem(DEMO_USER_KEY).catch(() => {})
    set({ isDemoMode: false, demoUserId: DEFAULT_DEMO_USER_ID, isLoading: false })
  },

  clearDemoMode: async () => {
    await demoStorage.removeItem(DEMO_KEY).catch(() => {})
    await demoStorage.removeItem(DEMO_USER_KEY).catch(() => {})
    set({ isDemoMode: false, demoUserId: DEFAULT_DEMO_USER_ID, isLoading: false })
  },

  signOut: async () => {
    // Clear synchronously, even if the network sign-out subsequently fails.
    useAuthStore.getState().setSession(null)
    const { error } = await supabase.auth.signOut()
    await useAuthStore.getState().clearDemoMode()
    if (error) throw error
  },

  initialize: () => {
    if (_initialized) return () => {}
    _initialized = true

    useAuthStore.getState().clearDemoMode().catch(() => {})

    // Get existing session
    const revision = sessionRevision
    let disposed = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!disposed && revision === sessionRevision) useAuthStore.getState().setSession(session)
    }).catch(() => {
      if (!disposed && revision === sessionRevision) useAuthStore.getState().setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!disposed) {
          useAuthStore.getState().setSession(session)
          if (event === 'PASSWORD_RECOVERY') set({ isRecovering: true })
        }
      },
    )

    return () => {
      disposed = true
      _initialized = false
      subscription.unsubscribe()
    }
  },
}))
