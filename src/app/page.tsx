'use client'

import { AppShell, Card, Container } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { Variables } from 'graphql-request'
import { gql, request } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { memo, Suspense } from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import { activeSlugsAtom, sortAtom } from '~/lib'
import Loading from './loading'

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
      <Suspense fallback={<Loading />}>
        <Item {...(data as Product[])?.[index]} />
      </Suspense>
    </figure>
  ),
  areEqual
)

export default function Index() {
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

  if (!slugs?.length) {
    return <Card>No vendors selected.</Card>
  }

  return (
    <AppShell
      styles={t => ({
        main: {
          backgroundColor:
            t.colorScheme === 'dark' ? t.colors.dark[8] : t.colors.gray[0]
        }
      })}>
      <Container>
        <Form />

        <WindowScroller>
          {p => (
            <List
              className="list"
              width="100%"
              {...{
                height: 'browser' in process ? window.innerHeight : 787,
                itemCount: data?.length ?? 0,
                itemData: data,
                itemSize: 500,
                ...p
              }}>
              {Row}
            </List>
          )}
        </WindowScroller>
      </Container>
    </AppShell>
  )
}

interface RowProps {
  index: number
  style: Record<string, any>
  data?: unknown
}
