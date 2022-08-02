/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-nested-ternary */
import { Card, Container, Paper, Skeleton } from '@mantine/core'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import { fetcher, omit, slugsAtom, sortAtom } from '~/lib'

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
  const ref = useRef<HTMLDivElement>(null!)

  const [itemSize, set] = useState(() => 5e2)
  const sortBy = useAtomValue(sortAtom)
  const slugs = useAtomValue(slugsAtom)

  const entries = useQueries({
    queries: [...Object.entries(slugs)]
      .map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-'))
      .map(k => ({
        enabled: !!slugs[k],
        queryFn: () =>
          fetcher<Result>(`https://${k}.myshopify.com/products.json?limit=150`),
        queryKey: ['products', k],
        select: ({ products = [] }: Result): Product[] =>
          products
            .filter(p => !!p.images.length)
            .map(p => ({
              ...omit(
                p,
                'images',
                'body_html',
                'options',
                'tags',
                'originalVariants'
              ),
              vendor: k
            })),
        suspense: true
      }))
  })

  const res = useMemo(
    () =>
      (entries ?? [])
        .flatMap(e => e?.data ?? [])
        .sort((a, b) => {
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
    [entries, sortBy]
  )

  useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const el = ref.current

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

    const ro = new ResizeObserver(([e]) => onResize(e.target as HTMLElement))

    const mo = new MutationObserver(
      ([e]) =>
        el instanceof HTMLElement &&
        e.removedNodes.length &&
        e.target instanceof HTMLElement &&
        e.target.tagName === 'FIGURE' &&
        onResize(el)
    )

    if (el instanceof HTMLElement) {
      ro.observe(document.body)
      mo.observe(el, { childList: true, subtree: true })
    }

    return () => {
      mo?.disconnect()
      ro?.disconnect()
    }
  }, [res])

  return (
    <Container {...{ ref }}>
      {![...Object.values(slugs)].filter(i => i)?.length ? (
        <Card>No vendors selected.</Card>
      ) : !res?.length ? (
        <Loader />
      ) : (
        <WindowScroller>
          {p => (
            <List
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
      )}
    </Container>
  )
}

export default function Index() {
  return (
    <Suspense fallback={null}>
      <Form />
      <Inner />
    </Suspense>
  )
}

interface Result {
  products: Product[]
  vendor: string
}

interface RowProps {
  index: number
  style: Record<string, any>
  data?: unknown
}
