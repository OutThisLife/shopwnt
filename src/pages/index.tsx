/* eslint-disable no-nested-ternary */
import { MenuOutlined } from '@ant-design/icons'
import { Button, Layout, Result, Skeleton, Spin } from 'antd'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Form, Item } from '~/components'
import type { State } from '~/ctx'
import { BrandContext } from '~/ctx'
import { useContentVisibility, useStorage } from '~/hooks'
import { omit, pick } from '~/lib'

const Page: React.FC = () => {
  const ctx = React.useContext(BrandContext)
  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))
  const [visible, set] = React.useState(() => false)
  const watch = useContentVisibility()

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

  React.useEffect(() => watch(document.getElementsByClassName('item')))

  return (
    <BrandContext.Provider value={{ ...state, setState }}>
      <Layout
        onPointerDown={toggle}
        onWheelCapture={toggle}
        style={{ minHeight: '100vh' }}>
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

        <Layout.Content style={{ padding: 'var(--pad)' }}>
          {(items?.length || 0) > 0 ? (
            items?.map(i => (
              <React.Suspense key={i.id} fallback={<Skeleton />}>
                <Item {...i} />
              </React.Suspense>
            ))
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
