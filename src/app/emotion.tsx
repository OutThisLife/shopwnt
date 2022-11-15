'use client'

import { CacheProvider } from '@emotion/react'
import type { ColorScheme } from '@mantine/core'
import {
  ColorSchemeProvider,
  MantineProvider,
  useEmotionCache
} from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { useServerInsertedHTML } from 'next/navigation'
import { useCallback, useState } from 'react'
import { theme } from '~/theme'

export default function RootStyleRegistry({
  children
}: {
  children: React.ReactNode
}) {
  const cache = useEmotionCache()
  cache.compat = true

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

  useServerInsertedHTML(() => (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(' ')
      }}
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
    />
  ))

  return (
    <CacheProvider value={cache}>
      <ColorSchemeProvider {...{ colorScheme, toggleColorScheme }}>
        <MantineProvider
          theme={{ colorScheme, ...theme }}
          withGlobalStyles
          withNormalizeCSS>
          <NotificationsProvider>{children}</NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </CacheProvider>
  )
}
