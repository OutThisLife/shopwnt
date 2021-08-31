import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
:root {
  --vsq: calc((1vw + 1vh) / 2);

  --primary: hsl(240, 100%, 50%);

  --bg-hsl: 0, 0%, 100%;
  --bg: hsl(var(--bg-hsl));

  --pad: calc(var(--vsq) * 4);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

main * {
  --primary-fg: 240, calc(var(--fs, 1) * 100%), calc(var(--fl, 1) * 50%);
  --primary-bg: 240, calc(var(--bs, 1) * 100%), calc(var(--bl, 1) * 50%);
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
  font-family: Poppins, sans-serif;
  font-size: clamp(13px, calc(var(--vsq) * 1.5), 14px);
  letter-spacing: 0.02em;
}

img {
  max-width: 100%;
  height: auto;
}

a {
  color: initial;

  &:hover{
    color: var(--primary)
  }
}

section {
  position: relative;
  max-width: 100vw;
  overflow: hidden;
  
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
