import * as React from 'react'
import type { Product } from '../../types'
import { clean } from '../util'
import StyledItem from './style'

export const Item: React.FC<Partial<Product>> = ({
  availability,
  children,
  handle,
  images,
  title,
  variants,
  vendor
}) => (
  <StyledItem>
    {children || (
      <>
        <a
          href={`https://${clean(
            `${vendor}`
          )}.myshopify.com/products/${handle}`}
          rel="noopener noreferrer"
          target="_blank">
          <h3>{title}</h3>

          <div>
            <strong>
              {parseFloat(`${variants?.[0]?.price}`).toLocaleString('en-US', {
                currency: 'USD',
                style: 'currency'
              })}
            </strong>
            <em>{vendor}</em>
          </div>

          <em>
            {availability?.title}
            <br />
            {availability?.inventory_quantity}
          </em>
        </a>

        <div>
          {images?.map(i => (
            <img key={i.id} alt="" loading="lazy" src={`${i.src}&width=250`} />
          ))}
        </div>
      </>
    )}
  </StyledItem>
)
