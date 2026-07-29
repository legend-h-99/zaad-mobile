/**
 * زاد — useSession hook
 * Convenient access to the current Supabase session + auth utilities.
 */
import { useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { useProfileStore } from '../store/profile'

export function useSession() {
  const { session, user, isLoading, isDemoMode, signOut, initialize } = useAuthStore()
  const { loadProfile, clearProfile } = useProfileStore()

  // Initialize auth on first mount
  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [])

  // Load profile whenever user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id)
    } else {
      clearProfile()
    }
  }, [user?.id])

  return {
    session,
    user,
    isLoading,
    isAuthenticated: !!session || isDemoMode,
    accessToken: session?.access_token,
    signOut,
  }
}
