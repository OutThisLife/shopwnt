import type { Product as IProduct } from '~/../types'
import { clean, fetcher } from '~/lib'

const shopify = (slug: string, path: string) =>
  new URL(path, `https://${slug}.myshopify.com`).toString()

const priceOf = (i: IProduct) => parseFloat(i?.variants?.[0]?.price) || 0
const timeOf = (i: any, k: string) => +new Date(i?.[k]) || 0

const cmp: Record<string, (a: any, b: any) => number> = {
  price: (a, b) => priceOf(a) - priceOf(b),
  created_at: (a, b) => timeOf(a, 'created_at') - timeOf(b, 'created_at'),
  updated_at: (a, b) => timeOf(a, 'updated_at') - timeOf(b, 'updated_at'),
  published_at: (a, b) => timeOf(a, 'published_at') - timeOf(b, 'published_at')
}

export const Query = {
  products: async (_: unknown, { where = {}, options = {} }: any) => {
    const ids: string[] = where.id_IN ?? []
    const handles: string[] = where.handle_IN ?? []

    if (ids.length && handles.length) {
      const res = await Promise.all(
        ids.map(id =>
          fetcher<{ product?: IProduct }>(shopify(handles[0], `products/${id}.json`))
        )
      )

      return res.flatMap(({ product }) =>
        product ? [{ ...product, vendor: handles[0] }] : []
      )
    }

    const { limit = 250, offset = 0, sort } = options
    const [field, dir] = Object.entries(sort?.[0] ?? { updated_at: 'ASC' })[0]
    const by =
      cmp[field] ??
      ((a, b) => `${a?.[field]}`.localeCompare(`${b?.[field]}`))

    const pages = await Promise.all(
      handles.map(k => {
        const u = new URL(shopify(k, 'products.json'))

        u.searchParams.set('limit', `${limit}`)
        u.searchParams.set('page', `${offset}`)

        return fetcher<{ products?: IProduct[] }>(u.toString())
      })
    )

    return pages
      .flatMap(({ products }, n) =>
        (products ?? [])
          .filter(i => i?.variants?.length)
          .map(i => ({ ...i, vendor: handles[n] }))
      )
      .sort((a, b) => (dir === 'ASC' ? by(a, b) : by(b, a)))
  }
}

export const Product = {
  price: (i: IProduct) => i?.variants?.[0]?.price ?? i?.price,
  url: (i: IProduct) =>
    `https://${clean(i?.vendor)}.myshopify.com/products/${i?.handle}`
}
