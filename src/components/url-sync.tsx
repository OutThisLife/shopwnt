'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  facetsAtom,
  resolveSortId,
  searchAtom,
  slugsAtom,
  sortAtom
} from '~/lib'

/** True after the one-time URL → atom hydration pass finishes. */
export const urlSyncReadyAtom = atom(false)

/**
 * Facets ride in one param as `key:a|b,key2:c`, so adding a filter group never
 * needs a new query param. Values are encoded individually — sizes and colors
 * contain the separators often enough to matter.
 */
const encodeFacets = (facets: Record<string, string[]>) =>
  Object.entries(facets)
    .filter(([, v]) => v.length)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}:${v.map(encodeURIComponent).join('|')}`)
    .join(',')

const decodeFacets = (raw: string): Record<string, string[]> =>
  Object.fromEntries(
    raw
      .split(',')
      .map(part => {
        const at = part.indexOf(':')

        if (at < 1) {
          return null
        }

        const values = part
          .slice(at + 1)
          .split('|')
          .map(decodeURIComponent)
          .filter(Boolean)

        return values.length
          ? ([decodeURIComponent(part.slice(0, at)), values] as const)
          : null
      })
      .filter(Boolean) as (readonly [string, string[]])[]
  )

/**
 * Two-way binds search / sort / brand / filter state to the URL query string so
 * a view is shareable, bookmarkable, and survives the back button. On first
 * mount the URL wins over persisted (localStorage) state; afterwards the URL
 * mirrors the live atoms.
 */
export function UrlSync() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useAtom(searchAtom)
  const [sort, setSort] = useAtom(sortAtom)
  const [slugs, setSlugs] = useAtom(slugsAtom)
  const [facets, setFacets] = useAtom(facetsAtom)
  const setUrlReady = useSetAtom(urlSyncReadyAtom)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const q = params?.get('q') ?? null
    const s = resolveSortId(params?.get('sort'))
    const b = params?.get('brands') ?? null
    const f = params?.get('filters') ?? null

    if (q !== null) {
      setSearch(q)
    }

    if (s) {
      setSort(s)
    }

    if (f) {
      setFacets(decodeFacets(f))
    }

    if (b !== null) {
      const list = b
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)

      setSlugs(prev => {
        const next: Record<string, boolean> = {}

        for (const k of Object.keys(prev)) {
          next[k] = false
        }

        for (const k of list) {
          next[k] = true
        }

        return next
      })
    }

    setReady(true)
    setUrlReady(true)
    // Hydrate from the URL exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A sort id retired since the link was made still resolves to a live one, so
  // rewrite the atom to match rather than leaving a dead value in storage.
  useEffect(() => {
    const live = resolveSortId(sort)

    if (live && live !== sort) {
      setSort(live)
    }
  }, [sort, setSort])

  useEffect(() => {
    if (!ready) {
      return
    }

    const next = new URLSearchParams()

    if (search) {
      next.set('q', search)
    }

    if (sort !== 'newest') {
      next.set('sort', sort)
    }

    const active = Object.entries(slugs)
      .filter(([, v]) => v)
      .map(([k]) => k)

    if (active.length) {
      next.set('brands', active.join(','))
    }

    const filters = encodeFacets(facets)

    if (filters) {
      next.set('filters', filters)
    }

    const qs = next.toString()
    const path = pathname ?? '/'

    router.replace(qs ? `${path}?${qs}` : path, { scroll: false })
  }, [ready, search, sort, slugs, facets, pathname, router])

  return null
}

export default UrlSync
