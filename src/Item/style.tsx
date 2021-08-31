import styled from 'styled-components'

export default styled.figure`
  border: 10px solid white;
  display: grid;
  margin: 1px auto;
  max-width: 100%;
  overflow: overlay;

  ::-webkit-scrollbar {
    width: 2px;
    height: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(0, 0%, 90%);
  }

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
      left: 0;
      padding: 2rem;
      place-content: center;
      position: sticky;
      text-align: center;
      text-decoration: none;
      z-index: 1;

      @media (max-width: 1024px) {
        grid-row: 2;
        padding: 2rem 2rem 3rem;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.5;
        text-decoration: underline;
      }

      table {
        display: inline-grid;
        font-size: min(11px, 0.7rem);
        font-weight: 300;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem;
        place-content: center;
        place-items: center;
        place-self: center;
        position: relative;

        @media (max-width: 1024px) {
          grid-auto-flow: column;
        }

        tbody {
          display: contents;
        }
      }

      strong {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }

    div {
      &:only-child {
        font-style: italic;
        grid-column: 1 / -1;
        padding: 5rem;
        text-align: center;
      }

      &:not(:only-child) {
        display: flex;
        gap: 0.5rem;
        place-content: start;
      }
    }
  }
`
