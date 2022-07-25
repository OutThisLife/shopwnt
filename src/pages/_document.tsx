import { CssBaseline } from '@nextui-org/react'
import type { DocumentContext } from 'next/document'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default class extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return {
      ...initialProps,
      styles: initialProps.styles
    }
  }

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

          {CssBaseline.flush()}
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
