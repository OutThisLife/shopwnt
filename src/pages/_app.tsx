import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import * as React from 'react'
import { GlobalStyles } from '~/theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>shopwnt</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      </Head>

      <main>
        <Component {...pageProps} />
      </main>

      <GlobalStyles key="global-style" />
    </>
  )
}

export const reportWebVitals = (metric: NextWebVitalsMetric) =>
  console.log(
    metric.name,
    `${metric.startTime?.toFixed(0)} -> ${metric.value?.toFixed(0)}`
  )

export default MyApp
