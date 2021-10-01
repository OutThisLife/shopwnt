import { Layout, Skeleton } from 'antd'
import 'normalize.css'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '../types'
import { Form, Item } from './components'
import type { State } from './ctx'
import { BrandContext } from './ctx'
import { useContentVisibility, useStorage } from './hooks'
import { fetcher, omit, pick } from './util'

const App: React.FC = () => {
  const ctx = React.useContext(BrandContext)
  const watch = useContentVisibility()

  const [state, setState] = useStorage<State>('ctx', omit(ctx, 'setState'))

  const vendor = React.useMemo(
    () =>
      state?.slugs?.size
        ? `${[...state.slugs.entries()].find(([, v]) => v)?.shift()}`
        : undefined,
    [state]
  )

  const key = React.useMemo(
    () =>
      vendor ? `https://${vendor}.myshopify.com/products.json?limit=150` : null,
    [vendor]
  )

  const { data, mutate } = useSWR<{ products: Product[] }>(key, fetcher)

  const items = Array.from([...(data?.products ?? [])])
    .map(p => ({
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

  React.useEffect(
    () => void window.scrollTo({ behavior: 'smooth', top: 0 }),
    [state, data]
  )

  React.useEffect(() => {
    const onMessage = (e: MessageEvent<any>) =>
      key && e.data === 'revalidate' && mutate(data, true)

    navigator.serviceWorker?.addEventListener('message', onMessage)

    return () =>
      navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [key])

  React.useLayoutEffect(() => watch(document.getElementsByClassName('item')))

  return (
    <BrandContext.Provider value={{ ...state, setState }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Form />

        <Layout.Content style={{ padding: '2rem' }}>
          {items.length > 0 ? (
            items.map(i => (
              <React.Suspense key={i.id} fallback={<Skeleton />}>
                <Item {...{ ...i, vendor: vendor ?? i?.vendor }} />
              </React.Suspense>
            ))
          ) : (
            <Item>
              <div>No products found</div>
            </Item>
          )}
        </Layout.Content>
      </Layout>
    </BrandContext.Provider>
  )
}

export default App
