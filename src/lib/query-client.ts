import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2, retryDelay: 1000 },
  },
})

export function clearAccountQueries() {
  // Cancellation aborts active reads before the next identity is published.
  void queryClient.cancelQueries().catch(error => console.warn('Query cancellation failed', error))
  queryClient.clear()
}
