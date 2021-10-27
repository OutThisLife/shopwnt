import 'antd/dist/antd.css'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import 'normalize.css'
import * as React from 'react'
import { createGlobalStyle } from 'styled-components'
import { Layout } from '~/components/antd'

const GlobalStyles = createGlobalStyle`
 :root {
    --vsq: calc((1vw + 1vh) / 2);
    --pad: calc(var(--vsq) * 4);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: #f36;
  }

  html {
    line-height: 1.3;
    font-family: Poppins, sans-serif;
    font-size: clamp(13px, calc(var(--vsq) * 1.5), 14px);
    letter-spacing: 0.02em;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 1024px) {
    input,
    select {
      font-size: max(1rem, 16px);
    }
  }
`

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>shopwnt</title>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    </Head>

    <GlobalStyles key="global-style" />

    <React.Suspense fallback={null}>
      <Layout style={{ minHeight: '100vh' }}>
        <Component {...pageProps} />
      </Layout>
    </React.Suspense>
  </>
)

export const reportWebVitals = (metric: NextWebVitalsMetric) =>
  console.log(
    metric.name,
    `${metric.startTime?.toFixed(0)} -> ${metric.value?.toFixed(0)}`
  )

export default MyApp
