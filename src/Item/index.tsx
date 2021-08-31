import * as React from 'react'
import type { Product } from '../../types'
import { clean, query } from '../util'
import StyledItem from './style'

export const Item: React.FC<
  Pick<Partial<Product>, 'variants' | 'handle' | 'vendor'>
> = ({ children, handle, variants, vendor }) => {
  const [product, setState] = React.useState<Partial<Product>>(() => ({
    handle,
    variants
  }))

  const href = React.useMemo(
    () => `https://${clean(`${vendor}`)}.myshopify.com/products/${handle}`,
    [vendor, handle]
  )

  React.useEffect(() => {
    const hydrate = async () => {
      const res = await query<{ product: Product }>(
        `${clean(`${vendor}`)}`,
        `products/${handle}`
      )

      setState({
        ...res.product,
        variants: res.product?.variants?.filter(
          v => v.inventory_quantity ?? Infinity
        )
      })
    }

    if (handle) {
      hydrate()
    }
  }, [handle])

  if (!product.variants?.length) {
    return <>{children}</>
  }

  return (
    <StyledItem>
      {children || (
        <>
          <aside>
            <a rel="noopener noreferrer" target="_blank" {...{ href }}>
              <h3>{product?.title}</h3>
            </a>

            <strong>
              {parseFloat(`${product?.variants?.[0]?.price}`).toLocaleString(
                'en-US',
                {
                  currency: 'USD',
                  style: 'currency'
                }
              )}
            </strong>

            <table>
              <tbody>
                {product?.variants?.map(v => (
                  <tr key={v.id}>
                    <td>{v.option3 ?? v.option2 ?? v.option1 ?? v.title}</td>
                    <td>({v.inventory_quantity ?? '∞'})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>

          <div>
            {product.images?.map(i => (
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
