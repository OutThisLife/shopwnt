import { Carousel } from '@mantine/carousel'
import { Badge, Card, Group, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { Variables } from 'graphql-request'
import request, { gql } from 'graphql-request'
import Image from 'next/future/image'
import type { Product } from '~/../types'
import { clean, relTime } from '~/lib'

export default function Item({ handle, vendor }: Partial<Product>) {
  const { data } = useQuery<Product>({
    enabled: !!(handle && vendor),
    queryFn: async ({ queryKey: [, args] }) =>
      request<Product>(
        '/api/graphql',
        gql`
          query GetProduct($id: [ID!], $handle: [ID!]!) {
            products(
              where: { id_IN: $id, handle_IN: $handle }
              options: { limit: 1 }
            ) {
              price
              title
              updated_at
              url
              images {
                src
                width
                height
              }
            }
          }
        `,
        args as Variables
      ),
    queryKey: ['product', { handle: [clean(vendor as string)], id: [handle] }],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (i: any): Product => i?.products?.[0],
    suspense: true
  })

  if (!data) {
    return null
  }

  return (
    <Card p="md" radius="md" shadow="sm" withBorder>
      <Group mb="sm" position="apart">
        <div>
          <Title order={3}>
            <a
              href={data?.url}
              rel="noopener noreferrer"
              style={{ color: 'inherit' }}
              target="_blank">
              {data?.title}
            </a>
          </Title>

          <Text color="dimmed" size="xs" transform="uppercase">
            {vendor} &mdash; {relTime(data?.updated_at)}
          </Text>
        </div>

        <Badge color="green" variant="light">
          {parseFloat(`${data?.price}`).toLocaleString('en-US', {
            currency: 'USD',
            style: 'currency'
          })}
        </Badge>
      </Group>

      <Card.Section>
        <Carousel
          align={(data?.images?.length ?? 0) > 1 ? 'start' : 'center'}
          breakpoints={[
            { minWidth: 'md', slideGap: 'sm', slideSize: '33.33%' },
            { maxWidth: 'sm', slideGap: 0, slideSize: '100%' }
          ]}
          draggable={data?.images?.length > 1}
          height={400}
          loop
          sx={{
            img: {
              height: '100%',
              objectFit: 'cover',
              width: '100%'
            }
          }}
          withControls={data?.images?.length > 1}
          withIndicators={data?.images?.length > 1}>
          {data?.images?.map(i => (
            <Carousel.Slide key={i.src}>
              <Image
                alt=""
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
