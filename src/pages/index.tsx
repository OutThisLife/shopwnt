import { Card, Container, Loading, Spacer } from '@nextui-org/react'
import Fuse from 'fuse.js'
import * as React from 'react'
import { areEqual } from 'react-window'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item, List, WindowScroller } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { fetcher, omit, pick } from '~/lib'

const Row = React.memo<{
  index: number
  style: Record<string, any>
  data?: unknown
}>(
  ({ index, style, data = [] }) => (
    <Item {...{ style, ...(data as any[])?.[index] }} />
  ),
  areEqual
)

export default function Index() {
  const ctx = React.useContext(BrandContext)
  const ref = React.useRef<HTMLElement>(null)

  const [itemSize, setItemSize] = React.useState<number>(() => 5e2)
  const [items, setItems] = React.useState<Record<string, Result>>(() => ({}))

  const [state, setState] = useStorage<State>(
    'ctx',
    omit(ctx, 'setState', 'search')
  )

  const value = React.useMemo(
    () => ({ ...state, setState, ts: Date.now() }),
    [state]
  )

  const vendors = [...value.slugs.entries()]
    .filter(([k, v]) => k && v)
    ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-'))

  const { isValidating } = useSWR<{ products: Product[]; vendor: string }[]>(
    () => (vendors.length ? vendors : null),
    async (...args: string[]) =>
      Promise.all(
        args.map<Promise<Result>>(async k => {
          const v: Result = {
            ...(await fetcher(
              `https://${k}.myshopify.com/products.json?limit=150`
            )),
            vendor: k
          }

          setItems(st => ({ ...st, [k]: v }))

          return v
        })
      )
  )

  const fuse = React.useRef(
    new Fuse<Product>([], {
      includeMatches: false,
      includeScore: false,
      keys: ['title'],
      shouldSort: false
    })
  ).current

  const sortedItems = React.useMemo(
    () =>
      [...Object.values(items)]
        ?.filter(i => i?.products?.length && vendors.includes(i?.vendor))
        ?.flatMap(i => i?.products.flatMap(p => ({ ...p, vendor: i.vendor })))
        ?.filter(p => !!p?.images?.length)
        ?.map(p => ({
          ...omit(
            p,
            'images',
            'body_html',
            'options',
            'tags',
            'originalVariants'
          ),
          variants: p.variants?.filter(v =>
            ['00', 'xs', 'petite', '0', '23', 'xxs', 'o/s']
              .flatMap(s => s.toLocaleLowerCase())
              .some(s =>
                Object.values(pick(v, 'option1', 'option2', 'option3'))
                  .filter(i => i)
                  .flatMap(i => i.toLocaleLowerCase())
                  .includes(s)
              )
          )
        }))
        .filter(p => !!p.variants?.length)
        .sort((a, b) => {
          const k = value.sortBy
          const av: string = a[k]
          const bv: string = b[k]

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
    [vendors, items]
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

  React.useEffect(() => void fuse?.setCollection(sortedItems), [sortedItems])

  const res = React.useMemo(() => {
    const s = fuse?.search(value.search ?? '')

    return s.length ? s : sortedItems
  }, [value.search, sortedItems])

  return (
    <BrandContext.Provider {...{ value }}>
      <React.Suspense fallback={null}>
        <Form />
      </React.Suspense>

      <Container as="section" css={{ padding: 10 }}>
        <Spacer y={1} />

        {isValidating || !res.length ? (
          <Card>
            <Loading size="xl" type="spinner" />
          </Card>
        ) : (
          <React.Suspense fallback={null}>
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
