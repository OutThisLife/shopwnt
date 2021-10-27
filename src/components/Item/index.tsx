import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { Text } from '~/components/antd'
import { fetcher, relTime } from '~/lib'
import StyledItem from './style'
import { Thumbnail } from './Thumbnail'

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
    <figure
      className="item"
      style={{
        padding: 'var(--pad)',
        ...style
      }}
      {...{ ref }}>
      <StyledItem
        actions={product?.variants
          ?.slice(0, 4)
          .map(
            v =>
              `${v.option3 ?? v.option2 ?? v.option1 ?? v.title} (${
                v.inventory_quantity ?? '∞'
              })`
          )}
        extra={
          price &&
          product?.updated_at && (
            <>
              {price && (
                <Text strong type="success">
                  {parseFloat(`${price}`).toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency'
                  })}
                </Text>
              )}

              <br />

              <Text style={{ fontSize: 12 }} type="secondary">
                {relTime(product?.updated_at)}
                <br />
                {relTime(product?.created_at)}
              </Text>
            </>
          )
        }
        title={
          <a href={product.url} rel="noreferer noreferrer" target="_blank">
            {product?.title}
          </a>
        }
        {...{ loading }}>
        {children ||
          product?.images?.map(({ id, src }) => (
            <Thumbnail key={id} {...{ src }} />
          ))}
      </StyledItem>
    </figure>
  )
})

Item.displayName = 'Item'

export default Item
