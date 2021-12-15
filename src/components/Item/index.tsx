import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { fetcher, relTime } from '~/lib'
import { Skeleton } from '..'
import StyledItem from './style'
import Thumbnail from './Thumbnail'

const Item = React.forwardRef<
  HTMLElement,
  Partial<Product & { $hide?: boolean; style?: Record<string, any> }>
>(function Item({ children, handle, style, vendor }, ref) {
  const url = `//${vendor}.myshopify.com/products/${handle}`

  const { data, isValidating } = useSWR<{ product: Product }>(
    `${url}.json`,
    fetcher
  )

  const loading = (!!data || isValidating) && !!children

  const product = {
    ...data?.product,
    url,
    variants: data?.product?.variants?.filter(
      v => v.inventory_quantity ?? Infinity
    )
  }

  const price = product?.variants?.[0]?.price

  return (
    <StyledItem className="item" {...{ ref, style }}>
      <div>
        {loading ? (
          <Skeleton />
        ) : (
          <>
            <div />

            <header>
              <div>
                <a href={product.url} rel="noopener noreferrer" target="_blank">
                  {product?.title}
                </a>

                <em>
                  {relTime(product?.updated_at)} -{' '}
                  {relTime(product?.created_at)}
                </em>
              </div>

              {price && (
                <strong>
                  {parseFloat(`${price}`).toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency'
                  })}
                </strong>
              )}
            </header>

            <section>
              {children ||
                product?.images?.map(({ id, src }) => (
                  <Thumbnail key={id} {...{ src }} />
                ))}
            </section>

            {price && product?.updated_at && (
              <footer>
                {product?.variants?.slice(0, 4).map(v => (
                  <a
                    key={v.id}
                    href={product.url}
                    rel="noopener noreferrer"
                    target="_blank">
                    {v.option3 ?? v.option2 ?? v.option1 ?? v.title}
                    {v.inventory_quantity ? ` (${v.inventory_quantity})` : ''}
                  </a>
                ))}
              </footer>
            )}

            <div />
          </>
        )}
      </div>
    </StyledItem>
  )
})

Item.displayName = 'Item'

export default Item
