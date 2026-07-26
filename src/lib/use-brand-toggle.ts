'use client'

import { useIsFetching } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { slugsAtom } from './atoms'

/**
 * Toggling a brand flips its checkmark immediately, but the grid behind needs a
 * round trip to catch up. Rows switched *on* since the last settle report as
 * pending so they can show that the change is in flight.
 */
export function useBrandToggle() {
  const [slugs, setSlugs] = useAtom(slugsAtom)
  const [pending, setPending] = useState<string[]>([])
  const fetching = useIsFetching({ queryKey: ['products'] })

  useEffect(() => {
    if (fetching) {
      return
    }

    // The refetch only starts a tick after the toggle, so wait a beat before
    // concluding nothing is in flight — otherwise every row clears instantly,
    // and rows that never trigger a fetch (turning the last brand off) still
    // stop spinning.
    const id = setTimeout(() => setPending(p => (p.length ? [] : p)), 150)

    return () => clearTimeout(id)
  }, [fetching])

  const toggle = (slug: string) => {
    setSlugs(s => ({ ...s, [slug]: !s[slug] }))

    // Switching a brand off only ever removes rows, which needs no reassurance.
    if (!slugs[slug]) {
      setPending(p => (p.includes(slug) ? p : [...p, slug]))
    }
  }

  return { toggle, pending }
}
