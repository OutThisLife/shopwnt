import type { ColorScheme } from '@mantine/core'
import { ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import { useCallback, useState } from 'react'
import { client } from '~/lib'

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

      <main>
        <QueryClientProvider {...{ client }}>
          <ColorSchemeProvider {...{ colorScheme, toggleColorScheme }}>
            <MantineProvider
              theme={{
                colorScheme,
                components: {
                  Button: {
                    defaultProps: {
                      color: 'pink'
                    }
                  },
                  Switch: {
                    defaultProps: {
                      color: 'pink'
                    }
                  }
                }
              }}
              withGlobalStyles
              withNormalizeCSS>
              <Component {...pageProps} />
            </MantineProvider>
          </ColorSchemeProvider>
        </QueryClientProvider>
      </main>
    </>
  )
}
