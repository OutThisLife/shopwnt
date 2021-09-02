import styled from 'styled-components'

export default styled.figure`
  display: grid;
  margin: 1px auto;
  min-height: 25vh;
  width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: 20rem 1fr;
    padding: 1rem 0;
  }

  @media (max-width: 1024px) {
    margin: 0 auto 5rem;
  }

  > {
    aside {
      background: var(--bg);
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: 1fr;
      padding: 2rem;
      place-content: center;
      text-align: center;
      text-decoration: none;
      place-items: center;
      z-index: 1;

      @media (max-width: 1024px) {
        display: flex;
        grid-row: 2;
        flex-direction: column;
        width: 100%;
        padding: 2rem 2rem 3rem;
      }

      > a {
        display: contents;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.5;
        text-decoration: underline;
      }

      table {
        display: flex;
        font-size: min(11px, 0.7rem);
        font-weight: 300;
        gap: 0.5rem;
        padding: 0.5rem;
        place-content: center;
        place-items: center;
        place-self: center;
        position: relative;
        max-width: 80%;
        flex-wrap: wrap;

        tbody {
          display: contents;
        }
      }

      strong {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }

    aside + div {
      display: flex;
      gap: 0.5rem;
      max-width: 100%;
      overflow: overlay;
      place-content: start;

      ::-webkit-scrollbar {
        height: 2px;
        width: 2px;
      }

      ::-webkit-scrollbar-thumb {
        background: hsl(0, 0%, 90%);
      }

      img {
        flex: auto 0 0;
      }
    }

    div:only-child {
      font-style: italic;
      grid-column: 1 / -1;
      padding: 5rem;
      text-align: center;
    }
  }
`
