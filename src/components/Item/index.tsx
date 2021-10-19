import { Typography } from 'antd'
import Image from 'next/image'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { useVisibility } from '~/hooks'
import { clean, fetcher, relTime } from '~/lib'
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
        }
        hoverable
        loading={!!children}
        onClick={() => window.open(product.url, '_blank')}
        title={<>{product?.title ?? '...'}</>}>
        {product?.images?.map(({ id, src }) => (
          <Image
            key={id}
            alt=""
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP89fZPPQAJMANkAJ520wAAAABJRU5ErkJggg=="
            height={250 * 1.5}
            loading="lazy"
            placeholder="blur"
            width={250}
            {...{ src }}
          />
        ))}
      </StyledItem>
    </figure>
  )
}
