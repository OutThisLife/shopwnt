'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  activeSlugsAtom,
  facetSelectionAtom,
  pruneFacetsAtom,
  searchAtom
} from './atoms'
import { gql, gqlFetch } from './util'

export interface FacetValue {
  value: string
  count: number
}

export interface Facet {
  key: string
  label: string
  values: FacetValue[]
}

const QUERY = gql`
  query GetFacets($slugs: [ID!]!, $q: String, $facets: [FacetSelection!]) {
    facets(where: { handle_IN: $slugs, q: $q, facets: $facets }) {
      key
      label
      values {
        value
        count
      }
    }
  }
`

/**
 * The filter groups the selected brands actually support. Both the groups and
 * their counts come from the live catalogs, so this is empty until at least one
 * brand is on and it reshapes whenever the selection changes.
 */
export function useFacets() {
  const slugs = useAtomValue(activeSlugsAtom)
  const q = useAtomValue(searchAtom)
  const selection = useAtomValue(facetSelectionAtom)
  const prune = useSetAtom(pruneFacetsAtom)

  const { data, isPending } = useQuery({
    enabled: slugs.length > 0,
    queryKey: ['facets', { slugs, q, selection }],
    queryFn: () =>
      gqlFetch<{ facets: Facet[] }>(QUERY, {
        slugs,
        q,
        facets: selection
      }).then(r => r.facets ?? [])
  })

  // Counts are computed with each group's own selection lifted, so a value you
  // picked still appears here as long as its brand is on. Anything missing from
  // this response genuinely no longer exists, and holding it would filter the
  // grid to nothing with no visible cause.
  useEffect(() => {
    if (data) {
      prune(Object.fromEntries(data.map(f => [f.key, f.values.map(v => v.value)])))
    }
  }, [data, prune])

  return { facets: data ?? [], loading: isPending && slugs.length > 0 }
}
