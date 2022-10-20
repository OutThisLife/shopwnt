import type { ColorScheme } from '@mantine/core'
import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useCallback, useState } from 'react'
import { client } from '~/lib'
import { theme } from '~/theme'

export default function App({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() =>
    'browser' in process &&
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light'
  )

  const toggleColorScheme = useCallback(
    (value?: ColorScheme) =>
      setColorScheme(st => value || (st === 'dark' ? 'light' : 'dark')),
    []
  )

  return (
    <>
      <Head>
        <title>shopwnt</title>
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
          name="viewport"
        />
      </Head>

      <QueryClientProvider {...{ client }}>
        <ColorSchemeProvider {...{ colorScheme, toggleColorScheme }}>
          <MantineProvider
            theme={{ colorScheme, ...theme }}
            withGlobalStyles
            withNormalizeCSS>
            <NotificationsProvider>
              <Component {...pageProps} />
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </>
  )
}
