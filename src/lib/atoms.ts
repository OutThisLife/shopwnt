import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { SetStateAction } from 'react'
import { clean, client } from '.'

export type SortField = 'price' | 'arrived' | 'revised'
export type SortDir = 'ASC' | 'DESC'
export type SortId = 'newest' | 'oldest' | 'updated' | 'price_asc' | 'price_desc'

export interface SortOption {
  value: SortId
  label: string
  field: SortField
  dir: SortDir
}

/**
 * Four date sorts was three too many: created_at, published_at and updated_at
 * are the same moment for most listings, so they produced near-identical orders
 * under different names. There are only two questions worth asking — what
 * showed up, and what changed — and `arrived` / `revised` resolve the raw
 * Shopify stamps into exactly those. See arrivedAt / revisedAt in util.ts.
 */
export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest', field: 'arrived', dir: 'DESC' },
  { value: 'updated', label: 'Recently updated', field: 'revised', dir: 'DESC' },
  { value: 'oldest', label: 'Oldest', field: 'arrived', dir: 'ASC' },
  { value: 'price_asc', label: 'Price: Low to High', field: 'price', dir: 'ASC' },
  { value: 'price_desc', label: 'Price: High to Low', field: 'price', dir: 'DESC' }
]

/** Retired sort ids, kept resolvable so old links and saved state still land. */
const LEGACY_SORT: Record<string, SortId> = { published: 'updated' }

export const resolveSortId = (id: string | null | undefined): SortId | null => {
  const v = LEGACY_SORT[id ?? ''] ?? id

  return SORT_OPTIONS.some(o => o.value === v) ? (v as SortId) : null
}

export const getSortOption = (id: SortId): SortOption =>
  SORT_OPTIONS.find(o => o.value === id) ?? SORT_OPTIONS[0]

const DEFAULT_BRANDS: Record<string, boolean> = {
  'for-love-lemons': false,
  'frame-denim': false,
  loveshackfancy: true,
  'naked-cashmere': false,
  selkiecollection: false,
  'stripe-stare': false,
  veronicabeard: false
}

const slugs = atomWithStorage<Record<string, boolean>>(
  'shopwnt:brands',
  DEFAULT_BRANDS
)

export const slugsAtom = atom(
  get => get(slugs),
  (get, set, arg: SetStateAction<Record<string, boolean>>) => {
    set(slugs, typeof arg === 'function' ? arg(get(slugs)) : arg)

    Object.entries(get(slugs))
      .filter(([, v]) => !v)
      .forEach(([k]) => client.removeQueries({ queryKey: ['products', k] }))
  }
)

/** False until persisted brands have been probed on load. */
export const brandsReadyAtom = atom(false)

export const activeSlugsAtom = atom(get => {
  if (!get(brandsReadyAtom)) {
    return []
  }

  return Object.entries(get(slugsAtom))
    .filter(([, v]) => v)
    .map(([k]) => clean(k))
})

export const sortAtom = atomWithStorage<SortId>('shopwnt:sort', 'newest')

export const searchAtom = atom('')

/** Selected facet values, keyed by the facet key the server hands back. */
const facets = atom<Record<string, string[]>>({})

export const facetsAtom = atom(
  get => get(facets),
  (get, set, arg: SetStateAction<Record<string, string[]>>) => {
    const next = typeof arg === 'function' ? arg(get(facets)) : arg

    // Empty groups are the same as absent, and leaving them in would churn the
    // query key and the URL for a filter that isn't filtering anything.
    set(
      facets,
      Object.fromEntries(Object.entries(next).filter(([, v]) => v.length > 0))
    )
  }
)

/** The shape the GraphQL layer wants, stable-ordered so it keys queries cleanly. */
export const facetSelectionAtom = atom(get =>
  Object.entries(get(facetsAtom))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => ({ key, values: [...values].sort() }))
)

export const facetCountAtom = atom(get =>
  Object.values(get(facetsAtom)).reduce((n, v) => n + v.length, 0)
)

/**
 * Brands own which catalogs are in play, so a value picked from a brand that's
 * since been switched off no longer exists to match — left alone it would
 * silently filter the grid to nothing. Drop whatever the live facets no longer
 * offer and keep the selections that still mean something.
 */
export const pruneFacetsAtom = atom(
  null,
  (get, set, offered: Record<string, string[]>) => {
    const current = get(facetsAtom)
    const fold = (s: string) => s.trim().toLowerCase()

    const next = Object.fromEntries(
      Object.entries(current).map(([key, values]) => {
        const live = new Set((offered[key] ?? []).map(fold))

        return [key, values.filter(v => live.has(fold(v)))]
      })
    )

    const same = Object.entries(next).every(
      ([k, v]) => v.length === current[k]?.length
    )

    if (!same) {
      set(facetsAtom, next)
    }
  }
)

/** Palette visibility, shared so the toolbar can get out of its way. */
export const paletteAtom = atom(false)
