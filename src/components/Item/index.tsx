import { Carousel } from '@mantine/carousel'
import { Anchor, Badge, Card, Group, Text } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons'
import { useQuery } from '@tanstack/react-query'
import type { Variables } from 'graphql-request'
import request, { gql } from 'graphql-request'
import Image from 'next/image'
import { useMemo } from 'react'
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

  const multi = useMemo(() => Number(data?.images?.length) > 1, [data])

  return (
    <Card p="lg" radius="md" shadow="sm">
      <Group mb="sm" position="apart">
        <div>
          <Anchor<'a'>
            color="primary"
            href={data?.url}
            rel="noopener noreferrer"
            size="xl"
            sx={{ fontWeight: 500 }}
            target="_blank">
            {data?.title} <IconExternalLink size={14} />
          </Anchor>

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
          align={multi ? 'start' : 'center'}
          breakpoints={[
            { minWidth: 'md', slideGap: 'xs', slideSize: '33.33%' },
            { maxWidth: 'sm', slideGap: 0, slideSize: '100%%' }
          ]}
          draggable={multi}
          height={400}
          loop
          withControls={multi}
          withIndicators={multi}>
          {data?.images?.map(i => (
            <Carousel.Slide key={i.src}>
              <Image
                alt=""
                height={Math.min(500, i?.height ?? 500)}
                loading="lazy"
                src={i.src}
                style={{
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center top',
                  width: '100%'
                }}
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
