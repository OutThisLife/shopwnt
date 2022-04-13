import { NextUIProvider } from '@nextui-org/react'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import { Suspense } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>shopwnt</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      </Head>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <NextUIProvider>
            <Component {...pageProps} />
          </NextUIProvider>
        </Suspense>
      </main>
    </>
  )
}

export const reportWebVitals = (metric: NextWebVitalsMetric) =>
  console.log(
    metric.name,
    `${metric.startTime?.toFixed(0)} -> ${metric.value?.toFixed(0)}`
  )
