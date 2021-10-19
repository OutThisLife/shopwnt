import 'antd/dist/antd.css'
import 'normalize.css'
import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
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
`
