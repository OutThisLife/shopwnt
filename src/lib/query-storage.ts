import {
  dehydrate,
  hydrate,
  type InfiniteData,
  type QueryClient
} from '@tanstack/react-query'

const KEY = 'shopwnt:query-cache:v1'
const MAX_AGE = 5 * 60_000
const PERSISTED = new Set(['products', 'facets', 'brand-meta'])

/** Restore the last view, retaining its real age so stale stock still refetches. */
export function persistQueries(client: QueryClient) {
  const firstPageAges = new WeakMap<object, number>()
  const firstPageAt = (query: {
    state: { data: unknown; dataUpdatedAt: number }
  }) => {
    const first = (query.state.data as InfiniteData<unknown[]> | undefined)
      ?.pages?.[0]

    if (!Array.isArray(first)) {
      return query.state.dataUpdatedAt
    }

    const at = firstPageAges.get(first) ?? query.state.dataUpdatedAt

    firstPageAges.set(first, at)

    return at
  }

  try {
    const snapshot = JSON.parse(localStorage.getItem(KEY) ?? 'null')

    if (Array.isArray(snapshot?.queries)) {
      hydrate(client, {
        mutations: [],
        queries: snapshot.queries.filter(
          (query: {
            queryKey?: unknown[]
            state?: { dataUpdatedAt?: number }
          }) => {
            const age = Date.now() - (query.state?.dataUpdatedAt ?? 0)

            return (
              PERSISTED.has(String(query.queryKey?.[0])) &&
              age >= 0 &&
              age < MAX_AGE
            )
          }
        )
      })
    }
  } catch {
    // Private browsing, full storage, or a damaged snapshot must not block shopping.
  }

  client
    .getQueryCache()
    .findAll({ queryKey: ['products'] })
    .forEach(firstPageAt)

  let timer: ReturnType<typeof setTimeout> | undefined

  const save = () => {
    clearTimeout(timer)
    timer = undefined

    try {
      const snapshot = dehydrate(client, {
        shouldDehydrateMutation: () => false,
        shouldDehydrateQuery: query =>
          PERSISTED.has(String(query.queryKey[0])) &&
          query.getObserversCount() > 0 &&
          query.state.status === 'success'
      })

      // Reload starts at the top. Don't serialize an entire infinite-scroll session.
      snapshot.queries = snapshot.queries.slice(0, 12).map(query => {
        if (query.queryKey[0] !== 'products') {
          return query
        }

        const data = query.state.data as InfiniteData<unknown>

        return {
          ...query,
          state: {
            ...query.state,
            dataUpdatedAt: firstPageAt(query),
            data: {
              pages: data.pages.slice(0, 1),
              pageParams: data.pageParams.slice(0, 1)
            }
          }
        }
      })

      const json = JSON.stringify(snapshot)

      if (json.length <= 1_000_000) {
        localStorage.setItem(KEY, json)
      }
    } catch {
      // Cache persistence is optional; live queries remain the source of truth.
    }
  }

  const unsubscribe = client.getQueryCache().subscribe(event => {
    if (
      event.type !== 'updated' ||
      event.action.type !== 'success' ||
      !PERSISTED.has(String(event.query.queryKey[0]))
    ) {
      return
    }

    // Appending a page updates the infinite query's timestamp, not its cover page.
    if (event.query.queryKey[0] === 'products') {
      firstPageAt(event.query)
    }

    if (!timer) {
      timer = setTimeout(save, 500)
    }
  })

  window.addEventListener('pagehide', save)

  return () => {
    unsubscribe()
    clearTimeout(timer)
    window.removeEventListener('pagehide', save)
  }
}
