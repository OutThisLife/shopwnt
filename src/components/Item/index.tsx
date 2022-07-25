import { Card, Col, Container, Row, Table, Text } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/future/image'
import * as React from 'react'
import type { Product, Variant } from '~/../types'
import { fetcher, pick, relTime } from '~/lib'

export function Item({ children, handle, vendor, ...props }: ItemProps) {
  const url = React.useMemo(
    () =>
      `https://${vendor
        ?.toLocaleLowerCase()
        .replace(/\s/g, '')}.myshopify.com/products/${handle}`,
    [vendor, handle]
  )

  const { data, error } = useQuery<Result>(
    ['product', url],
    async ({ queryKey: [, v] }) => fetcher<Result>(`${v}.json`),
    {
      enabled: !!(vendor && handle),
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      select: ({ product }: Result) => {
        const variants = (data?.product?.variants?.filter(
          v => v.inventory_quantity ?? Infinity
        ) ?? []) as Variant[]

        return {
          product: {
            ...product,
            price: variants?.[0]?.price,
            url,
            variants
          }
        }
      },
      suspense: true
    }
  )

  if (error) {
    return null
  }

  return (
    <Card
      className="item"
      css={{ h: '100%', margin: 'auto', w: '95%' }}
      role="listitem"
      {...props}>
      <Card.Header>
        <Col>
          <a
            href={data?.product?.url}
            rel="noopener noreferrer"
            target="_blank">
            <Text
              css={{
                '&:hover': { textDecoration: 'underline' },
                lineHeight: 1.1
              }}
              h2>
              {data?.product?.title}
            </Text>
          </a>

          <Text css={{ color: '$accents3' }} h5 size={12} transform="uppercase">
            {vendor} &mdash; {relTime(data?.product?.updated_at)}
          </Text>
        </Col>
      </Card.Header>

      {(!!children || data?.product?.images?.length) && (
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
          }}
          onClick={e => e.stopPropagation()}>
          {children ||
            data?.product?.images?.map(({ height, id, src, width }) => (
              <Container
                key={id}
                css={{
                  '@smMax': { width: '66% !important' },
                  flex: 'auto 0 0',
                  height: '100%',
                  img: {
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    width: '100%'
                  },
                  m: 0,
                  p: 0,
                  width: '33.33%'
                }}>
                <Image
                  height={Math.min(500, height ?? 500)}
                  loading="lazy"
                  width={Math.min(300, width ?? 300)}
                  {...{ src }}
                />
              </Container>
            ))}
        </Card.Body>
      )}

      {data?.product?.price && (
        <Card.Footer>
          <Row align="center" justify="space-between">
            <Row
              align="center"
              css={{
                gap: '1.5em',
                maxWidth: '100%',
                overflow: 'overlay',
                pr: '2rem',
                py: '1rem',
                whiteSpace: 'nowrap'
              }}>
              {Object.entries(
                (data?.product?.variants ?? [])
                  .filter(v =>
                    ['00', 'xs', 'petite', '0', '23', 'xxs', 'o/s']
                      .flatMap(s => s.toLocaleLowerCase())
                      .some(s =>
                        Object.values(pick(v, 'option1', 'option2', 'option3'))
                          .flatMap(i => i?.toLocaleLowerCase())
                          .includes(s)
                      )
                  )
                  .reduce<Record<string, Record<string, number>>>((acc, v) => {
                    const k = `${(v?.option1 ?? v.title).split(' / ').shift()}`

                    return {
                      ...acc,
                      [k]: {
                        ...acc[k],
                        [`${v.option3 ?? v.option2 ?? v.option1 ?? v.title}`]:
                          v?.inventory_quantity
                      }
                    }
                  }, {})
              ).map(([k, v], i) => (
                <Container
                  key={`${k}.${i}`}
                  css={{ flex: 'max-content 0 1', m: 0, p: 0 }}>
                  <Text css={{ flex: '100% 1 1', fontWeight: 600 }}>{k}</Text>

                  <Table
                    aria-label="Size/variants table"
                    css={{
                      height: 'auto',
                      p: 0,
                      td: {
                        '&:last-child': {
                          color: '$accents5',
                          pl: '.55em !important'
                        },
                        color: '$accents9',
                        p: '0 !important',
                        textAlign: 'right'
                      },
                      th: { fontSize: 0, h: 0, p: '0 !important' },
                      width: 'fit-content'
                    }}>
                    <Table.Header>
                      <Table.Column>Size</Table.Column>
                      <Table.Column>Qty</Table.Column>
                    </Table.Header>

                    <Table.Body>
                      {Object.entries(v).map(([k1, v1]) => (
                        <Table.Row key={`${k}.${i}.${k1}`}>
                          <Table.Cell>{k1}</Table.Cell>
                          <Table.Cell>({v1})</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Container>
              ))}
            </Row>

            <Text css={{ color: '$success', fontWeight: '$semibold' }}>
              {parseFloat(`${data?.product?.price}`).toLocaleString('en-US', {
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

Item.displayName = 'Item'

export interface ItemProps extends Partial<Product> {
  $hide?: boolean
  style?: Record<string, any>
  children?: JSX.Element
}

interface Result {
  product: Product
}

export default Item
