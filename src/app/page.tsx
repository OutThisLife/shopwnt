'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Loader2, PackageOpen, Store, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import type { Product } from '~/../types'
import { Item } from '~/components'
import {
  activeSlugsAtom,
  getSortOption,
  gql,
  gqlFetch,
  searchAtom,
  sortAtom
} from '~/lib'
import Loading from './loading'

const PAGE_SIZE = 24

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'

const QUERY = gql`
  query GetProducts(
    $slugs: [ID!]!
    $q: String
    $sort: [ProductSort!]
    $limit: Int
    $offset: Int
  ) {
    products(
      where: { handle_IN: $slugs, q: $q }
      options: { limit: $limit, offset: $offset, sort: $sort }
    ) {
      id
      created_at
      handle
      price
      published_at
      title
      updated_at
      vendor
    }
  }
`

function EmptyState({
  icon,
  title,
  description
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default function Index() {
  const sortId = useAtomValue(sortAtom)
  const slugs = useAtomValue(activeSlugsAtom)
  const q = useAtomValue(searchAtom)
  const sort = getSortOption(sortId)
  const sortArg = { [sort.field]: sort.dir }

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    enabled: slugs.length > 0,
    queryKey: ['products', { slugs, sort: sortArg, q }],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      gqlFetch<{ products: Product[] }>(QUERY, {
        slugs,
        q,
        sort: sortArg,
        limit: PAGE_SIZE,
        offset: pageParam
      }).then(r => r.products ?? []),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.flat().length
  })

  const products = data?.pages.flat() ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current

    if (!el || !hasNextPage) {
      return
    }

    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '800px 0px' }
    )

    io.observe(el)

    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!slugs.length) {
    return (
      <EmptyState
        description="Pick a brand from the Brands menu to start tracking new arrivals."
        icon={<Store className="size-6" />}
        title="No brands selected"
      />
    )
  }

  if (isError) {
    return (
      <EmptyState
        description="We couldn't reach the store right now. Try again in a moment."
        icon={<TriangleAlert className="size-6" />}
        title="Something went wrong"
      />
    )
  }

  if (isPending) {
    return (
      <div className={`${GRID} pt-8`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Loading key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        description={
          q
            ? `Nothing matched “${q}”. Try a different term.`
            : 'No products came back for the selected brands.'
        }
        icon={<PackageOpen className="size-6" />}
        title={q ? 'No matches' : 'Nothing here yet'}
      />
    )
  }

  return (
    <div className="pt-8">
      <div className={GRID}>
        {products.map(p => (
          <Item key={`${p.vendor}-${p.id}`} {...p} sortField={sort.field} />
        ))}
      </div>

      <div aria-hidden className="h-px w-full" ref={sentinelRef} />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading more…
        </div>
      )}

      {!hasNextPage && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          You've reached the end.
        </p>
      )}
    </div>
  )
}
