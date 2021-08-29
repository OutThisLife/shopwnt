import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
:root {
  --vsq: calc((1vw + 1vh) / 2);
  --primary: #00f;
  --bg: #fff;
  --pad: calc(var(--vsq) * 4);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

html {
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: clamp(13px, calc(var(--vsq) * 1.5), 16px);
  letter-spacing: 0.02em;
}

img {
  max-width: 100%;
  height: auto;
}

section {
  &:before,
  &:after {
    bottom: 0;
    content: '';
    cursor: progress;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: 0.25s;
  }

  &:after {
    z-index: 1;
    opacity: 0.95;
    background: var(--bg);
  }

  &:before {
    animation: rotate360 0.7s linear infinite;
    border: 2px solid rgba(97, 97, 97, 0.29);
    border-top-color: rgb(100, 100, 100);
    border-radius: 50%;
    bottom: auto;
    font-size: 32px;
    height: 1em;
    left: 50%;
    mix-blend-mode: difference;
    right: auto;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1em;
    z-index: 2;
  }

  body:not(.loading) & {
    &:after,
    &:before {
      pointer-events: none;
      opacity: 0;
    }
  }
}
`