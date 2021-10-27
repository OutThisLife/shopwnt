/* eslint-disable no-nested-ternary */
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item, List } from '~/components'
import { Layout, Result, Skeleton, Spin } from '~/components/antd'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { omit, pick } from '~/lib'

const Page: React.FC = () => {
  const ref = React.useRef<HTMLElement>(null)
  const ctx = React.useContext(BrandContext)
  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))
  const [height, setHeight] = React.useState(() => 550)

  const urls = [...state.slugs.entries()]
    .filter(([k, v]) => k && v)
    ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-'))

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
    [data]
  )

  const updateHeight = React.useCallback(
    (el: Element) => {
      const $items = el.getElementsByClassName('item')

      let h = 0

      Array.from($items ?? []).forEach(
        $i => (h = Math.max($i?.firstElementChild?.clientHeight || 0, h))
      )

      console.log(height, h)

      if (h && height !== h) {
        setHeight(h)
      }
    },
    [height]
  )

  React.useEffect(() => {
    const ro = new ResizeObserver(([e]) => updateHeight(e.target))

    if (ref.current instanceof HTMLElement) {
      window.requestAnimationFrame(() => updateHeight(ref.current as Element))
      ro.observe(ref.current)
    }

    return () => ro.disconnect()
  }, [])

  const Row = React.memo<{ index: number; style: Record<string, any> }>(
    ({ index, style }) => (
      <React.Suspense key={index} fallback={<Skeleton />}>
        <Item {...{ style, ...items?.[index] }} />
      </React.Suspense>
    ),
    (p, n) =>
      p.index === n.index && JSON.stringify(p.style) === JSON.stringify(n.style)
  )

  return (
    <BrandContext.Provider value={{ ...state, setState }}>
      <Layout>
        <Form />

        <Layout.Content>
          {(items?.length || 0) > 0 ? (
            <React.Suspense fallback={null}>
              <List
                height={
                  'browser' in process ? window.visualViewport.height : 768
                }
                innerRef={ref}
                itemCount={items?.length || 0}
                itemSize={height + 50}
                width="100%">
                {Row}
              </List>
            </React.Suspense>
          ) : isValidating ? (
            <Spin />
          ) : (
            <Result
              status="404"
              subTitle="Please add slugs from the search menu"
              title="No products added to watchlist"
            />
          )}
        </Layout.Content>
      </Layout>
    </BrandContext.Provider>
  )
}

export default Page
