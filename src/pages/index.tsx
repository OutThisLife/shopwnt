import { Card, Container, Paper, Skeleton } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { Variables } from 'graphql-request'
import { gql, request } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { memo, Suspense, useEffect, useState } from 'react'
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
    enabled: 'browser' in process && !!slugs.length,
    queryFn: ({ queryKey: [, args] }) =>
      request<Product[]>(
        '/api/graphql',
        gql`
          query GetProducts($slugs: [ID!]!, $sort: [ProductSort!]) {
            products(
              where: { handle_IN: $slugs }
              options: { limit: 25, offset: 0, sort: $sort }
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
        `,
        args as Variables
      ),
    queryKey: ['products', { slugs, sort: { [sortBy]: 'ASC' } }],
    select: (i: any): Product[] => i?.products,
    suspense: true
  })

  useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const handle = async () => {
      await Promise.all(
        [...(document.querySelectorAll('img') ?? [])]
          .filter(i => !i.complete)
          .map(
            i =>
              new Promise(r => {
                i.onload = r
              })
          )
      )

      set(
        await [...(document.getElementsByTagName('figure') ?? [])].reduce(
          async (acc, $item) =>
            Math.max(await acc, $item.getBoundingClientRect().height),
          Promise.resolve(0)
        )
      )
    }

    const el = document.querySelector('.list')
    const ro = new ResizeObserver(handle)
    const mo = new MutationObserver(handle)

    if (el instanceof HTMLElement) {
      ro.observe(el)
      mo.observe(el, { childList: true, subtree: true })
    }

    return () => {
      mo?.disconnect()
      ro?.disconnect()
    }
  }, [data])

  if (!slugs?.length) {
    return <Card>No vendors selected.</Card>
  }

  return (
    <WindowScroller>
      {p => (
        <List
          className="list"
          itemCount={data?.length ?? 0}
          itemData={data}
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
