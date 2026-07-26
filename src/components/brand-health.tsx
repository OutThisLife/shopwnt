'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { brandsReadyAtom, slugsAtom } from '~/lib'
import { urlSyncReadyAtom } from './url-sync'

/** On load, probe every persisted brand; drop any store that no longer responds. */
export function BrandHealthcheck() {
  const urlReady = useAtomValue(urlSyncReadyAtom)
  const [slugs, setSlugs] = useAtom(slugsAtom)
  const setReady = useSetAtom(brandsReadyAtom)
  const ran = useRef(false)

  useEffect(() => {
    if (!urlReady || ran.current) {
      return
    }

    ran.current = true

    const keys = Object.keys(slugs)

    if (!keys.length) {
      setReady(true)

      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(
          `/api/health?slugs=${keys.map(encodeURIComponent).join(',')}`
        )
        const json = (await res.json().catch(() => null)) as {
          results?: Record<string, boolean>
        } | null

        if (cancelled) {
          return
        }

        const results = json?.results ?? {}
        const failed = res.ok ? keys.filter(k => !results[k]) : []

        if (failed.length) {
          setSlugs(prev => {
            const next = { ...prev }

            for (const k of failed) {
              delete next[k]
            }

            return next
          })
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // Run once after URL hydration; slugs at that moment is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlReady])

  return null
}

export default BrandHealthcheck
