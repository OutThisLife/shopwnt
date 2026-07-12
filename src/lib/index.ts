import { QueryClient } from '@tanstack/react-query'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000
    }
  }
})

export * from './atoms'
export * from './util'
