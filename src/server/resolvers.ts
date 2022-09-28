import type { IResolvers } from '@graphql-tools/utils'
import type { Product as IProduct } from '~/../types'
import { clean, fetcher } from '~/lib'

export const Query: IResolvers<Queries, any, Args> = {
  getProduct: async (_, { handle, slug }) =>
    (
      await fetcher<{ product?: IProduct }>(
        `https://${slug
          ?.toLocaleLowerCase()
          .replace(/\s/g, '')}.myshopify.com/products/${handle}.json`
      )
    )?.product,

  getProducts: async (_, { slugs = [] }) =>
    (
      await Promise.all(
        slugs.flatMap(async k => ({
          ...(await fetcher<{ products?: IProduct[] }>(
            `https://${k}.myshopify.com/products.json?limit=150`
          )),
          vendor: k
        }))
      )
    )
      ?.flatMap(
        ({ products, vendor }) => products?.map(i => ({ ...i, vendor })) ?? []
      )
      ?.filter(({ images }) => !!images.length)
}

export const Product: IResolvers<IProduct, any, never> = {
  price: i => i?.price ?? i?.variants?.[0]?.price,
  url: i => `https://${clean(i?.vendor)}.myshopify.com/products/${i?.handle}`,
  vendor: i => clean(i?.vendor)
}

interface Queries {
  getProducts: IProduct[]
  getProduct: IProduct
}

interface Args {
  handle?: string
  slug?: string
  slugs?: string[]
}
