'use client'

import { useAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { slugsAtom } from './atoms'
import { storeHost } from './util'

/** Verifies a pasted domain or URL is a Shopify store, then adds it as a brand. */
export function useAddBrand() {
  const [slugs, setSlugs] = useAtom(slugsAtom)
  const [adding, setAdding] = useState(false)

  const addBrand = async (raw: string) => {
    const v = raw.trim()

    if (!v || adding) {
      return null
    }

    // A host already in the list is already a brand — skip the verify round-trip
    // and just make sure it's switched on. storeHost folds any URL shape down
    // to the hostname, so a full product URL matches the bare domain entry.
    const host = storeHost(v)
    const existing = Object.keys(slugs).find(
      s => storeHost(s) === host || s === host
    )

    if (existing) {
      if (slugs[existing]) {
        toast.info('Already added', { description: existing })

        return existing
      }

      // Exists but switched off — flip it back on instead of re-verifying.
      setSlugs(s => ({ ...s, [existing]: true }))
      toast.success('Brand added', { description: existing })

      return existing
    }

    setAdding(true)
    const id = toast.loading('Verifying Shopify domain…', {
      description: storeHost(v) || v
    })

    try {
      const res = await fetch(`/api/verify?u=${encodeURIComponent(v)}`)
      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.slug) {
        throw new Error(json?.error ?? 'Not a Shopify store')
      }

      setSlugs(s => ({ ...s, [json.slug]: true }))
      toast.success('Brand added', { id, description: json.slug })

      return json.slug as string
    } catch (err) {
      toast.error('Not a Shopify store', {
        id,
        description: err instanceof Error ? err.message : `Couldn't verify “${v}”`
      })

      return null
    } finally {
      setAdding(false)
    }
  }

  return { addBrand, adding }
}
