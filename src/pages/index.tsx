/* eslint-disable no-nested-ternary */
import * as React from 'react'
import { areEqual } from 'react-window'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item, List, Skeleton, WindowScroller } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { omit, pick, sleep } from '~/lib'

const Row = React.memo<{
  index: number
  style: Record<string, any>
  data?: unknown
}>(
  ({ index, style, data = [] }) => (
    <React.Suspense key={index} fallback={<Skeleton />}>
      <Item {...{ style, ...(data as Product[])?.[index] }} />
    </React.Suspense>
  ),
  areEqual
)

export default function Page() {
  const innerRef = React.useRef<HTMLElement>(null)
  const ctx = React.useContext(BrandContext)
  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))
  const [height, setHeight] = React.useState(() => 400)

  const value = React.useMemo(() => ({ ...state, setState }), [state])

  const urls = React.useMemo(
    () =>
      [...state.slugs.entries()]
        .filter(([k, v]) => k && v)
        ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-')),
    [state.slugs]
  )

  const { data, isValidating } = useSWR<
    { products: Product[]; vendor: string }[]
  >(
    () => (urls.length ? urls : null),
    async (...args: string[]) =>
      Promise.all(
        args.map<Promise<{ products: Product[]; vendor: string }>>(async k => ({
          ...(await (
            await fetch(`//${k}.myshopify.com/products.json?limit=150`)
          ).json()),
          vendor: k
        }))
      )
  )

  const items = React.useMemo(
    () =>
      data
        ?.filter(d => d?.products?.length)
        ?.flatMap(d => d?.products.flatMap(p => ({ ...p, vendor: d.vendor })))
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
        .filter(p => p.variants?.length)
        .sort((a, b) => {
          const k = state.sortBy
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
    [data, state.sortBy]
  )

  const updateHeight = React.useCallback((el: Element) => {
    if (!(el instanceof HTMLElement)) {
      return
    }

    const $items = el.getElementsByClassName('item')

    const h = [...Array.from($items ?? [])].reduce(
      (acc, $i) =>
        (acc = Math.max($i?.firstElementChild?.clientHeight || 0, acc)),
      0
    )

    if (h && height !== h) {
      setHeight(h)
    }
  }, [])

  React.useEffect(() => {
    const ro = new ResizeObserver(([e]) => updateHeight(e.target))

    ;(async () => {
      await (async (): Promise<void> => {
        // eslint-disable-next-line no-unreachable-loop
        while (!(innerRef.current instanceof HTMLElement)) {
          return sleep(1e3)
        }

        return Promise.resolve()
      })()

      window.requestAnimationFrame(() => {
        if (innerRef.current instanceof HTMLElement) {
          ro.observe(innerRef.current)
          updateHeight(innerRef.current)
        }
      })
    })()

    return () => ro.disconnect()
  }, [])

  return (
    <BrandContext.Provider {...{ value }}>
      <React.Suspense fallback={null}>
        <Form />
      </React.Suspense>

      <section>
        {(items?.length || 0) > 0 ? (
          <React.Suspense fallback={null}>
            <WindowScroller key={value.sortBy}>
              {({ onScroll, outerRef, ref, style }) => (
                <List
                  height={
                    'browser' in process ? window.visualViewport.height : 768
                  }
                  itemCount={items?.length ?? 1}
                  itemData={items}
                  itemSize={height + 50}
                  width="100%"
                  {...{ innerRef, onScroll, outerRef, ref, style }}>
                  {Row}
                </List>
              )}
            </WindowScroller>
          </React.Suspense>
        ) : isValidating ? (
          Array.from(Array(5).keys()).map(i => <Skeleton key={i} />)
        ) : (
          <em>Please add slugs from the search mene</em>
        )}
      </section>
    </BrandContext.Provider>
  )
}
