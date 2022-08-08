import { Carousel } from '@mantine/carousel'
import { Badge, Card, Group, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/future/image'
import { useMemo } from 'react'
import type { Product, Variant } from '~/../types'
import { fetcher, relTime } from '~/lib'

export default function Item({ handle, vendor }: Partial<Product>) {
  const url = useMemo(
    () =>
      `https://${vendor
        ?.toLocaleLowerCase()
        .replace(/\s/g, '')}.myshopify.com/products/${handle}`,
    [vendor, handle]
  )

  const { data } = useQuery<Result>(
    ['product', url],
    async ({ queryKey: [, v] }) => fetcher<Result>(`${v}.json`),
    {
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      select: ({ product }: Result) => {
        const variants = (product?.variants?.filter(
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

  return (
    <Card p="md" radius="md" shadow="sm" withBorder>
      <Group mb="sm" position="apart">
        <div>
          <Title order={3}>
            <a
              href={data?.product?.url}
              rel="noopener noreferrer"
              style={{ color: 'inherit' }}
              target="_blank">
              {data?.product?.title}
            </a>
          </Title>

          <Text color="dimmed" size="xs" transform="uppercase">
            {vendor} &mdash; {relTime(data?.product?.updated_at)}
          </Text>
        </div>

        <Badge color="green" variant="light">
          {parseFloat(`${data?.product?.price}`).toLocaleString('en-US', {
            currency: 'USD',
            style: 'currency'
          })}
        </Badge>
      </Group>

      <Card.Section>
        <Carousel
          align="start"
          breakpoints={[
            { minWidth: 'md', slideGap: 'sm', slideSize: '33.33%' },
            { maxWidth: 'sm', slideGap: 0, slideSize: '100%' }
          ]}
          height={400}
          loop
          withControls
          withIndicators>
          {data?.product?.images?.map(i => (
            <Carousel.Slide
              key={i.src}
              sx={{
                img: {
                  height: '100%',
                  objectFit: 'cover',
                  width: '100%'
                }
              }}>
              <Image
                height={Math.min(500, i?.height ?? 500)}
                loading="lazy"
                src={i.src}
                unoptimized
                width={Math.min(300, i?.width ?? 300)}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </Card.Section>
    </Card>
  )
}

interface Result {
  product: Product
}
