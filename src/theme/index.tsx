import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
 :root {
    --vsq: calc((1vw + 1vh) / 2);
    --pad: calc(var(--vsq) * 4);
    
    --fg-h: 0;
    --fg-s: 1%;
    --fg-l: 1%;

    --fg-hsl: var(--fg-h) var(--fg-s) var(--fg-l);
    --fg: hsl(var(--fg-hsl));
    
    --bg-h: 0;
    --bg-s: 1%;
    --bg-l: 100%;

    --bg-hsl: var(--bg-h) var(--bg-s) var(--bg-l);
    --bg: hsl(var(--bg-hsl));

    --accent: #00e;

    @media (prefers-color-scheme: dark) {
      /* --fg-l: 95%; */
      /* --bg-l: 10%; */
    }
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

  body {
    color: var(--fg);
    background: var(--bg);
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

  a {
    color: currentColor;
    text-decoration: none;
    transition: .2s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover { 
      color: var(--fg);
    }
  }

  main {
    min-height: 100vh;

    > section {
      padding: var(--pad);
    }
  }

  body * {
    --fg-hsl: var(--fg-h) calc(var(--fg-s) * var(--fg-sat, 1))
      calc(var(--fg-l) * var(--fg-lum, 1));
    --fg: hsl(var(--fg-hsl));
      
    --bg-hsl: var(--bg-h) calc(var(--bg-s) * var(--bg-sat, 1))
      calc(var(--bg-l) * var(--bg-lum, 1));
    --bg: hsl(var(--bg-hsl));
  }

  #log {
    background: #000;
    bottom: 0;
    color: #fff;
    font-size: 0.8rem;
    max-height: 50vh;
    max-width: 85vw;
    overflow: overlay;
    padding: 1rem;
    position: fixed;
    right: 0;
    z-index: 1000;
  }
`
