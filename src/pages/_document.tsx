import type { DocumentContext } from 'next/document'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { ServerStyleSheet } from 'styled-components'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html>
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
            strategy="beforeInteractive"
          />

          <style
            dangerouslySetInnerHTML={{
              __html: `
              :root {
                --vsq: calc((1vw + 1vh) / 2);
                --pad: calc(var(--vsq) * 4);
              }

              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
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
              }`
            }}
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

export default MyDocument
