import 'antd/dist/antd.css'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import * as React from 'react'
import { Layout } from '~/components/antd'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>shopwnt</title>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    </Head>

    <Layout style={{ minHeight: '100vh' }}>
      <Component {...pageProps} />
    </Layout>
  </>
)

export const reportWebVitals = (metric: NextWebVitalsMetric) =>
  console.log(
    metric.name,
    `${metric.startTime?.toFixed(0)} -> ${metric.value?.toFixed(0)}`
  )

export default MyApp
