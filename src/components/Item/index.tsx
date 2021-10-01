import { Divider, Space, Typography } from 'antd'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { useVisibility } from '~/hooks'
import { clean, fetcher, relTime } from '~/util'
import StyledItem from './style'

export const Item: React.FC<Pick<Partial<Product>, 'handle' | 'vendor'>> = ({
  children,
  handle,
  vendor
}) => {
  const [ref, isVisible] = useVisibility()
  const suspense = Boolean(handle && vendor && isVisible)
  const url = `https://${clean(`${vendor}`)}.myshopify.com/products/${handle}`

  const { data } = useSWR<{ product: Product }>(
    suspense ? `${url}.json` : null,
    { fetcher, suspense }
  )

  const product = {
    ...data?.product,
    url,
    variants: data?.product?.variants?.filter(
      v => v.inventory_quantity ?? Infinity
    )
  }

  const price = product?.variants?.[0]?.price

  return (
    <figure className="item" {...{ ref }}>
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
          <Space>
            <Typography.Text type="secondary">
              {relTime(product?.updated_at)}
              <br />
              {relTime(product?.created_at)}
            </Typography.Text>

            {price && (
              <>
                <Divider type="vertical" />

                <Typography.Text strong>
                  {parseFloat(`${price}`).toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency'
                  })}
                </Typography.Text>
              </>
            )}
          </Space>
        }
        hoverable
        loading={!!children}
        onClick={() => window.open(product.url, '_blank')}
        title={<>{product?.title ?? '...'}</>}>
        {product?.images?.map(i => (
          <img key={i.id} alt="" loading="lazy" src={`${i.src}&width=250`} />
        ))}
      </StyledItem>
    </figure>
  )
}

export default Item
