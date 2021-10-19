import Typography from 'antd/lib/typography'
import Image from 'next/image'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { fetcher, relTime } from '~/lib'
import StyledItem from './style'

const Item = React.forwardRef<
  HTMLElement,
  Partial<Product & { $hide?: boolean; style?: Record<string, any> }>
>(function Item({ $hide, children, handle, style, vendor }, ref) {
  const suspense = !!(handle && vendor)
  const url = `https://${vendor}.myshopify.com/products/${handle}`

  const { data, isValidating } = useSWR<{ product: Product }>(
    suspense ? `${url}.json` : null,
    { fetcher, suspense }
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
      style={
        $hide
          ? {
              pointerEvents: 'none',
              position: 'absolute',
              visibility: 'hidden'
            }
          : {
              padding: 'var(--pad)',
              ...style
            }
      }
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
                <Typography.Text strong type="success">
                  {parseFloat(`${price}`).toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency'
                  })}
                </Typography.Text>
              )}

              <br />

              <Typography.Text style={{ fontSize: 12 }} type="secondary">
                {relTime(product?.updated_at)}
                <br />
                {relTime(product?.created_at)}
              </Typography.Text>
            </>
          )
        }
        hoverable
        onClick={() => void (loading || window.open(product.url, '_blank'))}
        title={product?.title}
        {...{ loading }}>
        {children ||
          product?.images?.map(({ id, src }) => (
            <Image
              key={id}
              alt=""
              height={250 * 1.5}
              src={`${src}&w=250`}
              width={250}
            />
          ))}
      </StyledItem>
    </figure>
  )
})

Item.displayName = 'Item'

export default Item
