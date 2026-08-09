'use client'

import { useIsFetching, useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { brandActiveAtom } from './atoms'

const fallbackName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')

/** Canonical storefront name, independently cached by Shopify slug. */
export function useBrandName(slug: string) {
  const { data, isPending: resolving } = useQuery<{ name: string }>({
    queryKey: ['brand-meta', slug],
    enabled: !!slug,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`/api/brand?slug=${encodeURIComponent(slug)}`)
      const json = await res.json()

      if (!res.ok || !json?.name) {
        throw new Error(json?.error ?? 'Store name unavailable')
      }

      return json
    }
  })

  return {
    name: data?.name ?? fallbackName(slug),
    resolving
  } as const
}

/** Selection, request state, and resolved storefront name owned by one row. */
export function useBrand(slug: string) {
  const [active, toggleAtom] = useAtom(brandActiveAtom(slug))
  const fetching = useIsFetching({ queryKey: ['products'] })
  const [pending, setPending] = useState(false)
  const sawFetch = useRef(false)
  const identity = useBrandName(slug)

  useEffect(() => {
    if (!pending) {
      return
    }

    if (fetching) {
      sawFetch.current = true

      return
    }

    const id = setTimeout(
      () => {
        setPending(false)
        sawFetch.current = false
      },
      sawFetch.current ? 0 : 200
    )

    return () => clearTimeout(id)
  }, [fetching, pending])

  const toggle = useCallback(() => {
    if (!active) {
      setPending(true)
    }

    toggleAtom()
  }, [active, toggleAtom])

  return {
    active,
    pending,
    toggle,
    ...identity
  } as const
}
