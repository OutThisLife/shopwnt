/* eslint-disable no-nested-ternary */
import { Card, Container, Loading, Spacer } from '@nextui-org/react'
import * as React from 'react'
import { areEqual } from 'react-window'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { fetcher, omit } from '~/lib'

function Loader() {
  return (
    <Card>
      <Loading size="xl" type="spinner" />
    </Card>
  )
}

const Row = React.memo<RowProps>(
  ({ index, style, data = [] }) => (
    <figure
      style={{
        margin: '0 auto',
        paddingBottom: '2rem',
        width: '100%',
        ...style
      }}>
      <React.Suspense>
        <Item {...(data as Product[])?.[index]} />
      </React.Suspense>
    </figure>
  ),
  areEqual
)

export default function Index() {
  const ctx = React.useContext(BrandContext)
  const ref = React.useRef<HTMLElement>(null)

  const [itemSize, setItemSize] = React.useState<number>(() => 5e2)

  const [state, setState] = useStorage<State>(
    'ctx',
    omit(ctx, 'setState', 'search')
  )

  const value = React.useMemo(
    () => ({ ...state, setState, ts: Date.now() }),
    [state]
  )

  const { data } = useSWR<{ products: Product[]; vendor: string }[]>(
    () =>
      !value.slugs.size
        ? null
        : [...value.slugs.entries()]
            .filter(([k, v]) => k && v)
            ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-')),
    async (...s: string[]) =>
      Promise.all(
        s.map<Promise<Result>>(async vendor => ({
          ...(await fetcher(
            `https://${vendor}.myshopify.com/products.json?limit=150`
          )),
          vendor
        }))
      )
  )

  const res = React.useMemo(
    () =>
      Array.from(data ?? [])
        ?.flatMap(({ products = [], vendor }) =>
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
              vendor
            }))
        )
        .sort((a, b) => {
          const k = value.sortBy
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
        }) ?? [],
    [data, value.sortBy]
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
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <BrandContext.Provider {...{ value }}>
      <React.Suspense>
        <Form />
      </React.Suspense>

      <Container as="section" css={{ p: 10 }}>
        <Spacer y={1} />

        {![...value.slugs.values()].filter(i => i)?.length ? (
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
    </BrandContext.Provider>
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
