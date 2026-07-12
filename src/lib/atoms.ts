import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { SetStateAction } from 'react'
import { clean, client } from '.'

export type SortField = 'price' | 'updated_at' | 'created_at' | 'published_at'
export type SortDir = 'ASC' | 'DESC'
export type SortId =
  | 'newest'
  | 'oldest'
  | 'updated'
  | 'published'
  | 'price_asc'
  | 'price_desc'

export interface SortOption {
  value: SortId
  label: string
  field: SortField
  dir: SortDir
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest', field: 'created_at', dir: 'DESC' },
  { value: 'oldest', label: 'Oldest', field: 'created_at', dir: 'ASC' },
  { value: 'updated', label: 'Recently updated', field: 'updated_at', dir: 'DESC' },
  { value: 'published', label: 'Recently published', field: 'published_at', dir: 'DESC' },
  { value: 'price_asc', label: 'Price: Low to High', field: 'price', dir: 'ASC' },
  { value: 'price_desc', label: 'Price: High to Low', field: 'price', dir: 'DESC' }
]

export const getSortOption = (id: SortId): SortOption =>
  SORT_OPTIONS.find(o => o.value === id) ?? SORT_OPTIONS[0]

const DEFAULT_BRANDS: Record<string, boolean> = {
  fillyboo: false,
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

export const activeSlugsAtom = atom(get =>
  Object.entries(get(slugsAtom))
    .filter(([, v]) => v)
    .map(([k]) => clean(k))
)

export const sortAtom = atomWithStorage<SortId>('shopwnt:sort', 'newest')

export const searchAtom = atom('')
