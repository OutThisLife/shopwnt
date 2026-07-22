'use client'

import { useAtom } from 'jotai'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  SORT_OPTIONS,
  type SortId,
  searchAtom,
  slugsAtom,
  sortAtom
} from '~/lib'

const SORT_IDS = new Set<string>(SORT_OPTIONS.map(o => o.value))

/**
 * Two-way binds search / sort / brand state to the URL query string so a view
 * is shareable, bookmarkable, and survives the back button. On first mount the
 * URL wins over persisted (localStorage) state; afterwards the URL mirrors the
 * live atoms.
 */
export function UrlSync() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useAtom(searchAtom)
  const [sort, setSort] = useAtom(sortAtom)
  const [slugs, setSlugs] = useAtom(slugsAtom)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const q = params?.get('q') ?? null
    const s = params?.get('sort') ?? null
    const b = params?.get('brands') ?? null

    if (q !== null) {
      setSearch(q)
    }

    if (s && SORT_IDS.has(s)) {
      setSort(s as SortId)
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
    // Hydrate from the URL exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    const qs = next.toString()
    const path = pathname ?? '/'

    router.replace(qs ? `${path}?${qs}` : path, { scroll: false })
  }, [ready, search, sort, slugs, pathname, router])

  return null
}

export default UrlSync
