import { createTheme, NextUIProvider } from '@nextui-org/react'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import React from 'react'

const theme = createTheme({
  type:
    'browser' in process &&
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light'
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>shopwnt</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { overflow-y: scroll !important; scroll-behavior: smooth; }
            ::-webkit-scrollbar { width: 5px; height: 5px; background: transparent }
            ::-webkit-scrollbar-thumb { background: var(--nextui-colors-border, #000) }
            `
          }}
        />
      </Head>

      <main>
        <NextUIProvider {...{ theme }}>
          <React.Suspense fallback={null}>
            <Component {...pageProps} />
          </React.Suspense>
        </NextUIProvider>
      </main>
    </>
  )
}

export const reportWebVitals = (metric: NextWebVitalsMetric) =>
  console.log(
    metric.name,
    `${metric.startTime?.toFixed(0)} -> ${metric.value?.toFixed(0)}`
  )
