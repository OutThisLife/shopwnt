'use client'

import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { slugsAtom } from './atoms'
import { storeHost } from './util'

/** Verifies a pasted domain or URL is a Shopify store, then adds it as a brand. */
export function useAddBrand() {
  const setSlugs = useSetAtom(slugsAtom)
  const [adding, setAdding] = useState(false)

  const addBrand = async (raw: string) => {
    const v = raw.trim()

    if (!v || adding) {
      return null
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
