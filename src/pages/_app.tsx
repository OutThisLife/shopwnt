import { Layout } from 'antd'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import * as React from 'react'
import GlobalStyles from '../style'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    </Head>

    <GlobalStyles />

    <Layout style={{ minHeight: '100vh' }}>
      <Component {...pageProps} />
    </Layout>
  </>
)

export default MyApp
