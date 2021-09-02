import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '../../../types'
import { useVisibility } from '../../hooks'
import { clean, fetcher } from '../../util'
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
    () => (suspense ? `${url}.json` : null),
    { fetcher, suspense }
  )

  const product = {
    ...data?.product,
    url,
    variants: data?.product?.variants?.filter(
      v => v.inventory_quantity ?? Infinity
    )
  }

  return (
    <StyledItem {...{ ref }}>
      {children || (
        <>
          <aside>
            <a
              href={product?.url ?? '#/'}
              rel="noopener noreferrer"
              target="_blank">
              <h3>{product?.title ?? '...'}</h3>
            </a>

            {product?.id && (
              <>
                <strong>
                  {parseFloat(
                    `${product?.variants?.[0]?.price}`
                  ).toLocaleString('en-US', {
                    currency: 'USD',
                    style: 'currency'
                  })}
                </strong>

                <table>
                  <tbody>
                    {product?.variants?.map(v => (
                      <tr key={v.id}>
                        <td>
                          {v.option3 ?? v.option2 ?? v.option1 ?? v.title}
                        </td>
                        <td>({v.inventory_quantity ?? '∞'})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </aside>

          <div>
            {product?.images?.map(i => (
              <img
                key={i.id}
                alt=""
                loading="lazy"
                src={`${i.src}&width=250`}
              />
            ))}
          </div>
        </>
      )}
    </StyledItem>
  )
}

export default Item
