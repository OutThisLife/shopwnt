import type { IResolvers } from '@graphql-tools/utils'
import type { Product as IProduct } from '~/../types'
import { clean, fetcher } from '~/lib'

export const Query: IResolvers<any, any, any> = {
  products: async (_, args) => {
    const ids: string[] = args?.where?.id_IN ?? []
    const handles: string[] = args?.where?.handle_IN ?? []

    if (ids?.length && handles?.length) {
      return (
        await Promise.all(
          ids?.map(async id => {
            const u = new URL(
              `products/${id}.json`,
              `https://${handles?.[0]}.myshopify.com`
            )

            return fetcher<{ product?: IProduct }>(u.toString())
          })
        )
      )?.flatMap(({ product }) => product)
    }

    return (
      await Promise.all(
        handles?.flatMap(async k => {
          const u = new URL('products.json', `https://${k}.myshopify.com`)

          u.searchParams.append('limit', `${args?.options?.limit ?? 250}`)
          u.searchParams.append('page', `${args?.options?.offset ?? 0}`)

          return fetcher<{ products?: IProduct[] }>(u.toString())
        })
      )
    )
      ?.flatMap(({ products }, n) =>
        [...(products ?? [])]
          .map(i => ({ ...i, vendor: handles[n] }))
          .filter(i => !!i?.variants?.length)
      )
      ?.sort((prev, next) => {
        const [k, v] = Object.entries(
          args?.options?.sort?.[0] ?? { updated_at: 'ASC' }
        )[0]

        const a = v === 'ASC' ? prev : next
        const b = v === 'ASC' ? next : prev

        switch (k) {
          case 'price':
            return (
              parseFloat(a?.variants?.[0]?.price) -
              parseFloat(b?.variants?.[0]?.price)
            )

          case 'updated_at':
          case 'created_at': {
            return +new Date(a[k]) - +new Date(b[k])
          }

          default:
            return `${a[k]}`
              .toLowerCase()
              .localeCompare(`${b[k]}`.toLowerCase())
        }
      })
  }
}

export const Product: IResolvers<IProduct, any, never> = {
  price: i => i?.price ?? i?.variants?.[0]?.price,
  url: i => `https://${clean(i?.vendor)}.myshopify.com/products/${i?.handle}`
}
