/* eslint-disable no-nested-ternary */
import { MenuOutlined } from '@ant-design/icons'
import Button from 'antd/lib/button'
import Layout from 'antd/lib/layout'
import Skeleton from 'antd/lib/skeleton'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { areEqual, FixedSizeList as List } from 'react-window'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useStorage } from '~/hooks'
import { omit, pick } from '~/lib'

const Result = dynamic(() => import('antd/lib/result'), { ssr: false })
const Spin = dynamic(() => import('antd/lib/spin'), { ssr: false })

const Page: React.FC = () => {
  const ref = React.useRef<HTMLElement>(null)
  const ctx = React.useContext(BrandContext)
  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))
  const [visible, set] = React.useState(() => false)
  const [height, setHeight] = React.useState(() => 550)

  const toggle = (e: React.MouseEvent<HTMLElement>) => {
    if (visible && e.type === 'wheel') {
      set(false)
    } else if (!e.currentTarget?.className?.startsWith('ant-layout')) {
      set(st => !st)
    } else if (
      visible &&
      e.target instanceof HTMLElement &&
      e.target?.className?.startsWith('ant-layout')
    ) {
      set(false)
    }
  }

  const urls = [...state.slugs.entries()]
    .filter(([k, v]) => k && v)
    ?.map(([k]) => k.toLocaleLowerCase().replace(/\s/g, '-'))

  const { data, isValidating, mutate } = useSWR<
    { products: Product[]; vendor: string }[]
  >(
    () => (urls.length ? urls : null),
    async (...args: string[]) =>
      Promise.all(
        args.map<Promise<{ products: Product[]; vendor: string }>>(async k => ({
          ...(await (
            await fetch(`https://${k}.myshopify.com/products.json?limit=150`)
          ).json()),
          vendor: k
        }))
      )
  )

  const items = data
    ?.filter(d => d?.products?.length)
    ?.flatMap(d => d?.products.flatMap(p => ({ ...p, vendor: d.vendor })))
    ?.map(p => ({
      ...omit(p, 'images', 'body_html', 'options', 'tags', 'originalVariants'),
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
    })

  React.useEffect(() => {
    const onMessage = (e: MessageEvent<any>) =>
      e.data === 'revalidate' && mutate(data, true)

    navigator.serviceWorker?.addEventListener('message', onMessage)

    return () =>
      navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [mutate])

  React.useEffect(() => {
    if (ref.current instanceof HTMLElement) {
      const cb = (el: Element, a = el.getBoundingClientRect()) => {
        if (height !== a.height) {
          setHeight(a.height)
        }
      }

      const ro = new ResizeObserver(([e]) => cb(e.target))

      window.requestAnimationFrame(() => cb(ref.current as Element))
      ro.observe(ref.current)

      return () => {
        ro.disconnect()
      }
    }

    return () => null
  }, [])

  const Row = React.memo<{ index: number; style: Record<string, any> }>(
    ({ index, style }) => (
      <React.Suspense key={index} fallback={<Skeleton />}>
        <Item
          ref={index === 0 ? ref : undefined}
          {...{ style, ...items?.[index] }}
        />
      </React.Suspense>
    ),
    areEqual
  )

  return (
    <BrandContext.Provider value={{ ...state, setState }}>
      <Layout onPointerDown={toggle} onWheelCapture={toggle}>
        <Button
          icon={<MenuOutlined />}
          onPointerDown={toggle}
          style={{
            inset: 'calc(var(--pad) / 2) calc(var(--pad) / 2) auto auto',
            position: 'fixed',
            zIndex: 1e3
          }}
        />

        <Form {...{ toggle, visible }} />

        <Layout.Content>
          {(items?.length || 0) > 0 ? (
            <List
              height={'browser' in process ? window.visualViewport.height : 768}
              itemCount={items?.length || 0}
              itemSize={height + 50}
              width="100%">
              {Row}
            </List>
          ) : isValidating ? (
            <Spin />
          ) : (
            <Result
              extra={
                <Button onPointerDown={toggle} type="primary">
                  Open Menu
                </Button>
              }
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
