import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import 'normalize.css'
import * as React from 'react'

const Layout = dynamic(() => import('antd/lib/layout'))

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

export default MyApp
