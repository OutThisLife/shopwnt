import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { fetcher, relTime } from '~/lib'
import { Skeleton } from '..'
import StyledItem from './style'
import { Thumbnail } from './Thumbnail'

function Inner({ children, handle, vendor }: ItemProps) {
  const url = `https://${vendor}.myshopify.com/products/${handle}`

  const { data } = useSWR<{ product: Product }>(`${url}.json`, {
    fetcher,
    suspense: true
  })

  const product = React.useMemo(() => {
    const variants = data?.product?.variants?.filter(
      v => v.inventory_quantity ?? Infinity
    )

    return {
      ...data?.product,
      price: variants?.[0]?.price,
      url,
      variants
    }
  }, [data?.product])

  return (
    <div>
      <div />

      {product?.title && (
        <header>
          <div>
            <a href={product.url} rel="noopener noreferrer" target="_blank">
              {product?.title}
            </a>

            <em>
              {relTime(product?.updated_at)} &mdash; {vendor}
            </em>
          </div>

          {product.price && (
            <strong>
              {parseFloat(`${product.price}`).toLocaleString('en-US', {
                currency: 'USD',
                style: 'currency'
              })}
            </strong>
          )}
        </header>
      )}

      {(!!children || product?.images?.at(0)) && (
        <section>
          {children ||
            product?.images?.map(({ id, src }) => (
              <Thumbnail key={id} {...{ src }} />
            ))}
        </section>
      )}

      {!!product?.variants?.length && (
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
    </div>
  )
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  { style, ...props },
  ref
) {
  return (
    <StyledItem className="item" {...{ ref, style }}>
      <React.Suspense fallback={<Skeleton />}>
        <Inner {...props} />
      </React.Suspense>
    </StyledItem>
  )
})

Item.displayName = 'Item'

export interface ItemProps extends Partial<Product> {
  $hide?: boolean
  style?: Record<string, any>
  children?: JSX.Element
}

export default Item
