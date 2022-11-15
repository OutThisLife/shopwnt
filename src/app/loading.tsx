'use client'

import { Paper, Skeleton } from '@mantine/core'

export default function Loading() {
  return (
    <Paper p="lg" radius="md" shadow="xl">
      <Skeleton height={15} mb={2} />
      <Skeleton height={15} />
      <Skeleton height={200} mt={10} />
    </Paper>
  )
}
