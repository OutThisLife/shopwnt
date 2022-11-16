'use client'

import { AppShell, Container } from '@mantine/core'
import type { ReactNode } from 'react'
import { Form } from '~/components'

export default function Template({ children }: { children?: ReactNode }) {
  return (
    <AppShell
      styles={t => ({
        main: {
          backgroundColor:
            t.colorScheme === 'dark' ? t.colors.dark[8] : t.colors.gray[0]
        }
      })}>
      <Container>
        <Form />

        {children}
      </Container>
    </AppShell>
  )
}
