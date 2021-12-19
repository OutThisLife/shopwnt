import styled from 'styled-components'

export default styled.div`
  background: #fff;
  box-shadow: 0 0.5em 1em -0.4em hsla(0, 0%, 0%, var(--shadow-alpha, 0.1));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  inset: 0 0 auto;
  max-height: 350px;
  overflow: hidden;
  padding: calc(var(--pad) / 2);
  padding-right: calc(var(--pad) * 2);
  position: fixed;
  transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
  width: auto;
  z-index: 1000;

  &:not(.visible) {
    max-height: 0;
    padding-block: 0;
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    padding: calc(var(--pad) / 2);
  }

  > {
    .tags {
      display: flex;
      flex-wrap: wrap;
      place-content: flex-start;
      position: relative;

      > div {
        display: contents;
      }

      @media (max-width: 1024px) {
        gap: inherit;

        > div {
          display: flex;
          max-width: calc(100% - (var(--pad) * 2));
          overflow: overlay;
        }
      }

      span {
        background: var(--accent);
        color: var(--bg);
        display: flex;
        font-size: 0.9rem;
        place-content: center;
        place-items: center;

        > svg {
          cursor: pointer;
          margin-left: 1ch;
        }

        + * {
          border-left-color: transparent;
        }
      }

      input {
        align-self: flex-start;
        flex: auto 1 1;
      }
    }

    .sort {
      display: flex;
      place-content: flex-start;

      > select {
        flex: auto 1 1;
        text-transform: capitalize;
      }
    }
  }
`
