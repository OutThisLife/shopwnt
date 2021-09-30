import styled from 'styled-components'

export default styled.form<{ $open?: boolean }>`
  --closed: calc(1 - var(--opened, 0));
  --nav: 3rem;

  &[data-open='true'] {
    --opened: 1;
  }

  background: var(--bg);
  border: 0;
  box-shadow: 0 0 20px #00000022;
  left: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  transition: 0.2s ease-in-out;
  user-select: none;
  z-index: 1000;

  @media (max-width: 1024px) {
    transform: translateY(calc(var(--closed, 0) * -1 * (100% - var(--nav))));

    + section {
      padding-top: 3rem;
    }
  }

  > fieldset {
    all: unset;
    border: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0 1rem;
    place-content: space-between;
    place-items: center;

    @media (min-width: 1024px) {
      gap: calc(var(--vsq) * 3);
      padding: 1rem;
    }

    [type='submit'] {
      position: absolute;
      visibility: hidden;
    }

    > a {
      display: flex;
      height: var(--nav);
      place-content: center;
      place-items: center;
      width: 100%;

      @media (min-width: 1024px) {
        display: none;
      }

      > span {
        display: grid;
        grid-gap: 4px;
        grid-template-columns: 1fr;
        width: 2rem;

        > span {
          background: var(--primary);
          height: 2px;
          width: 100%;
        }
      }
    }

    > div {
      display: flex;
      gap: 1em;
      place-items: center;
    }
  }
`
