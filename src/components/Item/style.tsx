import styled from 'styled-components'

export default styled.figure`
  --gap: calc(var(--vsq) * 2);

  padding: var(--pad) calc(var(--pad) * 2);
  user-select: none;

  > div {
    --bg-lum: 2;

    background: var(--bg);
    border-radius: 0.4rem;
    box-shadow: 0 0.5em 1em -0.4em hsla(0, 0%, 0%, var(--shadow-alpha, 0.1));
    display: grid;
    gap: var(--gap);
    grid-auto-flow: row dense;
    grid-auto-rows: auto;
    grid-template-columns: repeat(40, 1fr);
    transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-property: box-shadow;

    &:hover {
      --shadow-alpha: 0.2;
    }

    > * {
      grid-column: 3 / -3;
    }
  }

  > div > {
    header {
      display: flex;
      place-content: space-between;
      place-items: center;

      > div {
        display: flex;
        flex-direction: column;
        gap: 1ch;

        > {
          a {
            font-size: 1.7rem;
            font-weight: 500;
            line-height: 1;
          }

          em {
            font-size: max(12px, 0.7rem);
            font-style: normal;
            line-height: 1.5;
          }
        }
      }

      > strong {
        font-size: 1.5rem;
        font-weight: 600;
      }
    }

    section {
      display: grid;
      grid-auto-columns: max-content;
      grid-auto-flow: column dense;
      max-width: 100%;
      overflow: overlay;
      width: 100%;

      &:before,
      &:after {
        content: none;
      }

      > * {
        flex: auto 0 0;
      }
    }

    footer {
      display: flex;
      place-content: space-evenly;
      place-items: center;

      > a {
        font-size: 11px;
        font-weight: 500;
      }
    }
  }
`
