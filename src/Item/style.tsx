import styled from 'styled-components'

export default styled.figure`
  display: grid;
  margin: 1px auto;
  max-width: 100%;
  overflow: overlay;

  @media (min-width: 1024px) {
    grid-template-columns: calc(var(--vsq) * 20) 1fr;
  }

  > a {
    backdrop-filter: blur(50px);
    background: #ffffff99;
    color: initial;
    display: grid;
    grid-gap: 1em;
    left: 0;
    padding: 2rem;
    place-content: center;
    position: sticky;
    text-decoration: none;
    z-index: 1;

    h3 {
      font-size: 1.5rem;
      line-height: 1.5;
      text-decoration: underline;
    }

    em {
      display: block;
      font-size: 0.7rem;
      line-height: 1;
    }

    strong {
      display: block;
      font-size: 0.9rem;
    }
  }

  > div {
    &:only-child {
      font-style: italic;
      grid-column: 1 / -1;
      padding: 2rem;
      text-align: center;
    }

    &:not(:only-child) {
      display: flex;
      margin-left: auto;
    }

    img {
      margin: 0.2rem;
    }
  }
`
