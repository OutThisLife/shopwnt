import { Card, Container, Paper, Skeleton } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { Variables } from 'graphql-request'
import { gql, request } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { memo, Suspense, useEffect, useMemo, useState } from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import { activeSlugsAtom, sortAtom } from '~/lib'

function Loader() {
  return (
    <Paper p="lg" radius="md" shadow="xl">
      <Skeleton height={15} mb={2} />
      <Skeleton height={15} />
      <Skeleton height={200} mt={10} />
    </Paper>
  )
}

const Row = memo<RowProps>(
  ({ index, style, data = [] }) => (
    <figure
      role="listitem"
      style={{
        margin: '0 auto',
        paddingBlock: '2rem',
        width: '100%',
        ...style
      }}>
      <Suspense fallback={<Loader />}>
        <Item {...(data as Product[])?.[index]} />
      </Suspense>
    </figure>
  ),
  areEqual
)

function Inner() {
  const [itemSize, set] = useState(() => 5e2)
  const sortBy = useAtomValue(sortAtom)
  const slugs = useAtomValue(activeSlugsAtom)

  const { data } = useQuery({
    enabled: !!slugs.length,
    queryFn: ({ queryKey: [, args] }) =>
      request<Product[]>(
        '/api/graphql',
        gql`
          query GetProducts($slugs: [ID!]!) {
            getProducts(slugs: $slugs) {
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
        `,
        args as Variables
      ),
    queryKey: ['products', { slugs }],
    select: (i: any): Product[] => i?.getProducts,
    suspense: true
  })

  const res = useMemo(
    () =>
      data?.sort((a, b) => {
        const k = sortBy
        const av = `${a[k]}`
        const bv = `${b[k]}`

        switch (k) {
          case 'price':
            return (
              parseFloat(b.variants?.[0]?.price) -
              parseFloat(a?.variants?.[0]?.price)
            )

          case 'updated_at':
          case 'created_at': {
            return +new Date(bv) - +new Date(av)
          }

          default:
            return `${av}`.toLowerCase().localeCompare(`${bv}`.toLowerCase())
        }
      }),
    [data, sortBy]
  )

  useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const el = document.querySelector('.list')

    const onResize = async (e: HTMLElement) => {
      const $items = [
        ...(e?.querySelectorAll('[role="listitem"] > div') ?? [])
      ] as HTMLElement[]

      if ($items.length) {
        set(
          await $items.reduce(async (acc, $item) => {
            await Promise.all(
              [...($item?.querySelectorAll('img') ?? [])]
                ?.filter(i => !i.complete)
                .map(
                  i =>
                    new Promise(r => {
                      i.onload = r
                    })
                )
            )

            return Math.max(
              await acc,
              ($item?.clientHeight || 0) + ($item?.offsetTop || 0)
            )
          }, Promise.resolve(0))
        )
      }
    }

    const ro = new ResizeObserver(
      () => el instanceof HTMLElement && onResize(el)
    )

    const mo = new MutationObserver(
      () => el instanceof HTMLElement && onResize(el)
    )

    if (el instanceof HTMLElement) {
      ro.observe(el)
      mo.observe(el, {
        attributeFilter: ['role'],
        childList: true,
        subtree: true
      })
    }

    return () => {
      mo?.disconnect()
      ro?.disconnect()
    }
  }, [])

  if (!slugs?.length) {
    return <Card>No vendors selected.</Card>
  }

  return (
    <WindowScroller>
      {p => (
        <List
          className="list"
          itemCount={res?.length ?? 0}
          itemData={res}
          width="100%"
          {...{
            height: 'browser' in process ? window.innerHeight : 787,
            itemSize,
            ...p
          }}>
          {Row}
        </List>
      )}
    </WindowScroller>
  )
}

export default function Index() {
  return (
    <Container>
      <Suspense>
        <Form />
      </Suspense>

      <Suspense fallback={<Loader />}>
        <Inner />
      </Suspense>
    </Container>
  )
}

interface RowProps {
  index: number
  style: Record<string, any>
  data?: unknown
}
