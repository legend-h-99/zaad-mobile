import type { Session } from '@supabase/supabase-js'

import { queryClient } from '../src/lib/query-client'
import { useAuthStore } from '../src/store/auth'
import { useProfileStore } from '../src/store/profile'

const mockGetSession = jest.fn()
const mockSignOut = jest.fn()
const mockUnsubscribe = jest.fn()
let mockAuthChange: (event: string, session: Session | null) => void
let mockResults: Record<string, Promise<{ data: unknown; error: unknown }>> = {}

jest.mock('expo-secure-store', () => ({ deleteItemAsync: jest.fn().mockResolvedValue(undefined) }))
jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
      onAuthStateChange: (callback: typeof mockAuthChange) => {
        mockAuthChange = callback
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
      },
    },
    from: (table: string) => {
      const request = mockResults[table] ?? Promise.resolve({ data: null, error: null })
      return {
        select() { return this },
        eq() { return this },
        maybeSingle: () => request,
        then: request.then.bind(request),
      }
    },
  },
}))

function session(id: string): Session {
  return { access_token: id, refresh_token: id, expires_in: 3600, token_type: 'bearer', user: { id, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } }
}

beforeEach(() => {
  queryClient.setDefaultOptions({ queries: { gcTime: 0, retry: false } })
  useAuthStore.getState().setSession(null)
  queryClient.clear()
  mockResults = {}
  mockGetSession.mockReset()
  mockSignOut.mockReset().mockResolvedValue({ error: null })
})

afterEach(() => queryClient.clear())

test('switching accounts clears queries and profiles before publishing the next identity', () => {
  useAuthStore.getState().setSession(session('A'))
  queryClient.setQueryData(['lab-reports', 'A'], ['private report'])
  useProfileStore.setState({ medications: [{ id: 'private' } as never] })
  useAuthStore.getState().setSession(session('B'))
  expect(queryClient.getQueryData(['lab-reports', 'A'])).toBeUndefined()
  expect(useProfileStore.getState().medications).toEqual([])
  expect(useAuthStore.getState().user?.id).toBe('B')
})

test('token refresh for the same account preserves its cache', () => {
  useAuthStore.getState().setSession(session('A'))
  queryClient.setQueryData(['lab-reports', 'A'], ['report'])
  useAuthStore.getState().setSession({ ...session('A'), access_token: 'refreshed' })
  expect(queryClient.getQueryData(['lab-reports', 'A'])).toEqual(['report'])
})

test('an in-flight query cannot repopulate account A after switching to B', async () => {
  useAuthStore.getState().setSession(session('A'))
  let resolve!: (value: string[]) => void
  const query = queryClient.fetchQuery({ queryKey: ['lab-reports', 'A'], queryFn: () => new Promise<string[]>(done => { resolve = done }) }).catch(() => undefined)
  useAuthStore.getState().setSession(session('B'))
  resolve(['old report'])
  await query
  expect(queryClient.getQueryData(['lab-reports', 'A'])).toBeUndefined()
})

test('late profile responses and queued requests from the old account are discarded', async () => {
  useAuthStore.getState().setSession(session('A'))
  let resolve!: (value: { data: unknown; error: unknown }) => void
  mockResults.health_profiles = new Promise(done => { resolve = done })
  const request = useProfileStore.getState().loadProfile('A')
  useAuthStore.getState().setSession(session('B'))
  resolve({ data: { id: 'old', user_id: 'A', full_name: 'old patient' }, error: null })
  await request
  await useProfileStore.getState().loadProfile('A')
  expect(useProfileStore.getState().profile).toBeNull()
  expect(useProfileStore.getState().isLoading).toBe(false)
})

test('the newest profile wins when two loads overlap', async () => {
  useAuthStore.getState().setSession(session('A'))
  let resolve!: (value: { data: unknown; error: unknown }) => void
  mockResults.health_profiles = new Promise(done => { resolve = done })
  const old = useProfileStore.getState().loadProfile('A')
  mockResults.health_profiles = Promise.resolve({ data: { id: 'new', user_id: 'A', full_name: 'current' }, error: null })
  await useProfileStore.getState().loadProfile('A')
  resolve({ data: { id: 'old', user_id: 'A', full_name: 'stale' }, error: null })
  await old
  expect(useProfileStore.getState().profile?.id).toBe('new')
})

test('sign-out clears private data immediately even when the remote sign-out fails', async () => {
  useAuthStore.getState().setSession(session('A'))
  queryClient.setQueryData(['progress-logs', 'A'], ['private'])
  mockSignOut.mockResolvedValue({ error: new Error('offline') })
  const operation = useAuthStore.getState().signOut()
  expect(useAuthStore.getState().user).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toEqual([])
  await expect(operation).rejects.toThrow('offline')
})

test('a delayed initial session cannot overwrite a newer authentication event', async () => {
  let resolve!: (value: { data: { session: Session | null } }) => void
  mockGetSession.mockReturnValue(new Promise(done => { resolve = done }))
  const cleanup = useAuthStore.getState().initialize()
  mockAuthChange('SIGNED_IN', session('B'))
  resolve({ data: { session: session('A') } })
  await Promise.resolve()
  expect(useAuthStore.getState().user?.id).toBe('B')
  cleanup()
})

test('a delayed initial session cannot restore a signed-out account', async () => {
  let resolve!: (value: { data: { session: Session | null } }) => void
  mockGetSession.mockReturnValue(new Promise(done => { resolve = done }))
  const cleanup = useAuthStore.getState().initialize()
  await useAuthStore.getState().signOut()
  resolve({ data: { session: session('A') } })
  await Promise.resolve()
  expect(useAuthStore.getState().user).toBeNull()
  cleanup()
})

test('recovery events preserve the session and clear after completion or sign-out', () => {
  mockGetSession.mockReturnValue(new Promise(() => {}))
  const cleanup = useAuthStore.getState().initialize()
  mockAuthChange('PASSWORD_RECOVERY', session('A'))
  expect(useAuthStore.getState().isRecovering).toBe(true)
  expect(useAuthStore.getState().user?.id).toBe('A')
  useAuthStore.getState().clearRecovery()
  expect(useAuthStore.getState().isRecovering).toBe(false)
  mockAuthChange('PASSWORD_RECOVERY', session('A'))
  useAuthStore.getState().setSession(null)
  expect(useAuthStore.getState().isRecovering).toBe(false)
  cleanup()
})
