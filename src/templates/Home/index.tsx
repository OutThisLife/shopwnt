import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, List, Skeleton, WindowScroller } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { fetcher, omit, pick, sleep } from '~/lib'

const Row = React.lazy(() => import('./Row'))

export default function View() {
  const ctx = React.useContext(BrandContext)
  const innerRef = React.useRef<HTMLElement>(null)

  const [itemSize, setItemSize] = React.useState<number>(() => 5e2)
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

  const onResize = React.useCallback(async (el: HTMLElement) => {
    const $items = (
      [...(el?.getElementsByClassName('item') ?? [])] as HTMLElement[]
    )
      .map($item => ({
        $item,
        baseHeight: $item.style.getPropertyValue('height'),
        images: [
          ...($item?.getElementsByTagName('img') ?? [])
        ] as HTMLImageElement[]
      }))
      .filter(i => i.images.length)

    if ($items.length) {
      let h = 0

      const $images = $items.flatMap(i => i.images)

      if (!$images.every(i => i.complete)) {
        await Promise.all(
          $images.map(
            im =>
              new Promise(r => {
                im.onload = r
              })
          )
        )
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const { $item, baseHeight } of $items) {
        $item.style.removeProperty('height')
        h = Math.max(h, $item?.scrollHeight)
        $item.style.setProperty('height', baseHeight)
      }

      setItemSize(st => h || st)
    }
  }, [])

  const ro = React.useRef(
    'browser' in process &&
      new ResizeObserver(([e]) => onResize(e.target as HTMLElement))
  ).current

  const onItemsRendered = React.useCallback(async () => {
    const el = innerRef.current

    if (
      el instanceof HTMLElement &&
      ro instanceof ResizeObserver &&
      !el.classList.contains('observed')
    ) {
      el.classList.add('observed')

      ro.observe(el)

      el.style.visibility = 'hidden'

      await sleep(1e3)
      await onResize(el)

      el.style.visibility = ''
    }
  }, [onResize])

  React.useEffect(
    () => () => void (ro instanceof ResizeObserver && ro.disconnect()),
    []
  )

  return (
    <BrandContext.Provider {...{ value }}>
      <React.Suspense fallback={null}>
        <Form />
      </React.Suspense>

      <section>
        {items?.length ? (
          <React.Suspense fallback={null}>
            <WindowScroller>
              {({ outerRef, ref, style }) => (
                <List
                  height={'browser' in process ? window.innerHeight : 768}
                  itemCount={items?.length ?? 0}
                  itemData={items}
                  width="100%"
                  {...{
                    innerRef,
                    itemSize,
                    onItemsRendered,
                    outerRef,
                    ref,
                    style
                  }}>
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
