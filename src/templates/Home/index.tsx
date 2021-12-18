import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, List, Skeleton, WindowScroller } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { fetcher, log, omit, pick, sleep } from '~/lib'

const Row = React.lazy(() => import('./Row'))

export default function View() {
  const ctx = React.useContext(BrandContext)
  const innerRef = React.useRef<HTMLElement>(null)

  const [itemSize, setItemSize] = React.useState<number>(() => 400)
  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))

  const value = React.useMemo(
    () => ({ ...state, setState, ts: Date.now() }),
    [state]
  )

  const urls = [...value.slugs.entries()]
    .filter(([k, v]) => k && v)
    ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-'))

  const { data, isValidating } = useSWR<
    { products: Product[]; vendor: string }[]
  >(
    () => (urls.length ? urls : null),
    async (...args: string[]) =>
      Promise.all(
        args.map<Promise<{ products: Product[]; vendor: string }>>(async k => ({
          ...(await fetcher(
            `https://${k}.myshopify.com/products.json?limit=150`
          )),
          vendor: k
        }))
      )
  )

  const items = React.useMemo(
    () =>
      data
        ?.filter(d => d?.products?.length)
        ?.flatMap(d => d?.products.flatMap(p => ({ ...p, vendor: d.vendor })))
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
          const av = a[k]
          const bv = b[k]

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
    [data, value.sortBy]
  )

  const onResize = React.useCallback((el: Element) => {
    const h = ([...(el?.getElementsByClassName('item') ?? [])] as HTMLElement[])
      .map(e => {
        const ov = e.style.getPropertyValue('height')
        e.style.removeProperty('height')

        const v = e?.scrollHeight
        e.style.setProperty('height', ov)

        return v ?? 0
      })
      .reduce((acc, i) => (acc = Math.max(i, acc)), 0)

    setItemSize(st => h || st)
  }, [])

  React.useEffect(() => {
    if (!('browser' in process)) {
      return () => void null
    }

    const ro = new ResizeObserver(([e]) => onResize(e.target))

    ;(async () => {
      await (async (): Promise<void> => {
        // eslint-disable-next-line no-unreachable-loop
        while (!(innerRef.current instanceof HTMLElement)) {
          return sleep(1e3)
        }

        ro.observe(innerRef.current)
        onResize(innerRef.current)

        return Promise.resolve()
      })()
    })()

    return () => void ro.disconnect()
  }, [])

  log(itemSize)

  return (
    <BrandContext.Provider {...{ value }}>
      <React.Suspense fallback={null}>
        <Form />
      </React.Suspense>

      <section>
        {items?.length ? (
          <React.Suspense fallback={null}>
            <WindowScroller>
              {({ onScroll, outerRef, ref, style }) => (
                <List
                  height={'browser' in process ? window.innerHeight : 768}
                  itemCount={items?.length ?? 0}
                  itemData={items}
                  onItemsRendered={() =>
                    itemSize || onResize(outerRef.current ?? innerRef.current)
                  }
                  style={{ visibility: itemSize ? '' : 'hidden', ...style }}
                  width="100%"
                  {...{ innerRef, itemSize, onScroll, outerRef, ref }}>
                  {Row}
                </List>
              )}
            </WindowScroller>
          </React.Suspense>
        ) : (
          isValidating &&
          Array.from(Array(5).keys()).map(i => <Skeleton key={i} />)
        )}
      </section>
    </BrandContext.Provider>
  )
}
