/* eslint-disable no-nested-ternary */
import { Card, Container, Loading, Spacer } from '@nextui-org/react'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import * as React from 'react'
import { areEqual } from 'react-window'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import { fetcher, omit, slugsAtom, sortAtom } from '~/lib'

function Loader() {
  return (
    <Card>
      <Loading size="xl" type="spinner" />
    </Card>
  )
}

const Row = React.memo<RowProps>(
  ({ index, style, data = [] }) => (
    <React.Suspense fallback={<Loader />}>
      <figure
        style={{
          margin: '0 auto',
          paddingBottom: '2rem',
          width: '100%',
          ...style
        }}>
        <Item {...(data as Product[])?.[index]} />
      </figure>
    </React.Suspense>
  ),
  areEqual
)

export default function Index() {
  const ref = React.useRef<HTMLElement>(null)
  const [itemSize, setItemSize] = React.useState<number>(() => 5e2)

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

  const res = React.useMemo(
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

  const onResize = React.useCallback(async (el: HTMLElement) => {
    const $items = (
      [...(el?.getElementsByClassName('item') ?? [])] as HTMLElement[]
    ).map($item => ({
      $item,
      images: [
        ...($item?.getElementsByTagName('img') ?? [])
      ] as HTMLImageElement[]
    }))

    if ($items.length) {
      const h = await $items.reduce(async (acc, { $item, images = [] }) => {
        await Promise.all(
          images
            .filter(i => !i.complete)
            .map(
              i =>
                new Promise(r => {
                  i.onload = r
                })
            )
        )

        const v = ($item?.clientHeight || 0) + ($item?.offsetTop || 0)

        return Math.max(await acc, v)
      }, Promise.resolve(0))

      if (h) {
        setItemSize(h)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const el = ref.current

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
      ro.observe(el)
      mo.observe(el, { childList: true, subtree: true })
    }

    return () => {
      mo?.disconnect()
      ro?.disconnect()
    }
  }, [])

  return (
    <>
      <React.Suspense>
        <Form />
      </React.Suspense>

      <Container as="section" css={{ p: 10 }}>
        <Spacer y={1} />

        {![...Object.values(slugs)].filter(i => i)?.length ? (
          <Card>No vendors selected.</Card>
        ) : !res?.length ? (
          <Loader />
        ) : (
          <React.Suspense fallback={<Loader />}>
            <WindowScroller>
              {p => (
                <List
                  className="list"
                  height={'browser' in process ? window.innerHeight : 768}
                  itemCount={res?.length ?? 0}
                  itemData={res}
                  width="100%"
                  {...{ itemSize, ...p }}>
                  {Row}
                </List>
              )}
            </WindowScroller>
          </React.Suspense>
        )}

        <Spacer y={1} />
      </Container>
    </>
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
