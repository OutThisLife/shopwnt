import { Card, Col, Row, styled, Text } from '@nextui-org/react'
import * as React from 'react'
import useSWR from 'swr'
import type { Product } from '~/../types'
import { fetcher, pick, relTime } from '~/lib'

const StyledImage = styled(Card.Image, { flex: 'auto 0 0', m: 0 } as any)

function Inner({ children, handle, vendor, ...props }: ItemProps) {
  const url = React.useMemo(
    () =>
      `https://${vendor
        ?.toLocaleLowerCase()
        .replace(/\s/g, '')}.myshopify.com/products/${handle}`,
    [vendor, handle]
  )

  const { data, error } = useSWR<{ product: Product }>(() => `${url}.json`, {
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

  const onClick = React.useCallback(
    () => window.open(product.url, '_blank'),
    [product]
  )

  if (error) {
    return null
  }

  return (
    <Card
      className="item"
      clickable
      css={{ h: '100%', margin: 'auto', w: '95%' }}
      role="listitem"
      {...{ onClick, ...props }}>
      {product?.title && (
        <Card.Header as="hgroup">
          <Col>
            <Text h2>{product?.title}</Text>

            <Text
              css={{ color: '$accents3' }}
              h5
              size={12}
              transform="uppercase">
              {vendor} &mdash; {relTime(product?.updated_at)}
            </Text>
          </Col>
        </Card.Header>
      )}

      {(!!children || product?.images?.length) && (
        <Card.Body
          css={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            maxWidth: '100%',
            overflow: 'overlay',
            placeContent: 'flex-start',
            placeItems: 'stretch',
            py: 0
          }}>
          {children ||
            product?.images?.map(({ id, src }) => (
              <StyledImage
                key={id}
                height="auto"
                objectFit="cover"
                width="33.33%"
                {...{ src }}
              />
            ))}
        </Card.Body>
      )}

      {product.price && (
        <Card.Footer>
          <Row align="center" justify="space-between" wrap="wrap">
            {product?.variants
              ?.slice(0, 4)
              ?.filter(v =>
                ['00', 'xs', 'petite', '0', '23', 'xxs', 'o/s']
                  .flatMap(s => s.toLocaleLowerCase())
                  .some(s =>
                    Object.values(pick(v, 'option1', 'option2', 'option3'))
                      .filter(i => i)
                      .flatMap(i => i.toLocaleLowerCase())
                      .includes(s)
                  )
              )
              .map(v => (
                <Text key={v.id} b css={{ color: '$accents5' }}>
                  {v.option3 ?? v.option2 ?? v.option1 ?? v.title}
                  {v.inventory_quantity ? ` (${v.inventory_quantity})` : ''}
                </Text>
              ))}

            <Text
              css={{ color: '$success', fontWeight: '$semibold', ml: 'auto' }}>
              {parseFloat(`${product.price}`).toLocaleString('en-US', {
                currency: 'USD',
                style: 'currency'
              })}
            </Text>
          </Row>
        </Card.Footer>
      )}
    </Card>
  )
}

export const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  { style, ...props },
  ref
) {
  return (
    <figure
      style={{
        margin: '0 auto',
        paddingBottom: '2rem',
        width: '100%',
        ...style
      }}
      {...{ ref }}>
      <React.Suspense fallback={null}>
        <Inner {...props} />
      </React.Suspense>
    </figure>
  )
})

Item.displayName = 'Item'

export interface ItemProps extends Partial<Product> {
  $hide?: boolean
  style?: Record<string, any>
  children?: JSX.Element
}

export default Item
