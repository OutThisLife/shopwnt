import { createGetInitialProps } from '@mantine/next'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

const getInitialProps = createGetInitialProps()

export default class extends Document {
  static getInitialProps = getInitialProps

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />

          <link href="https://fonts.googleapis.com" rel="preconnect" />

          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
            rel="stylesheet"
          />

          <Script
            dangerouslySetInnerHTML={{
              __html: `navigator.serviceWorker.register('/worker.js', { scope: '/' })`
            }}
            id="server-worker"
            strategy="beforeInteractive"
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
