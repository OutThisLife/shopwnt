'use client'

import { createGetInitialProps } from '@mantine/next'
import { QueryClientProvider } from '@tanstack/react-query'
import { DefaultSeo } from 'next-seo'
import type { ReactNode } from 'react'
import { client } from '~/lib'
import RootStyleRegistry from './emotion'

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <html lang="en">
      <DefaultSeo
        additionalMetaTags={[
          {
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
            name: 'viewport'
          }
        ]}
        defaultTitle="shopwnt"
      />

      <body>
        <QueryClientProvider {...{ client }}>
          <RootStyleRegistry>{children}</RootStyleRegistry>
        </QueryClientProvider>
      </body>
    </html>
  )
}

RootLayout.getInitialProps = createGetInitialProps()
