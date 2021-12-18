import styled from 'styled-components'

export default styled.figure`
  --gap: calc(var(--vsq) * 2);

  padding-block: var(--pad);
  user-select: none;

  @media (min-width: 1024px) {
    padding-inline: calc(var(--pad) * 2);
  }

  > div {
    &:hover {
      --shadow-alpha: 0.2;
    }

    border-radius: 0.4rem;
    border: 2px solid transparent;
    box-shadow: 0 0.5em 2em -0.4em hsla(0, 0%, 0%, var(--shadow-alpha, 0.1));
    display: grid;
    grid-auto-flow: row dense;
    grid-auto-rows: auto;
    grid-template-columns: repeat(40, 1fr);
    place-content: flex-start;
    row-gap: var(--gap);
    transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-property: box-shadow;
    width: 100%;

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
      }

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

      strong {
        font-size: 1.25rem;
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
