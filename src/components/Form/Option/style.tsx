import styled from 'styled-components'

export default styled.label`
  --pad: 1ch;

  color: hsla(0, 0%, 0%, 0.5);
  display: flex;
  font-weight: 500;
  gap: var(--pad);
  letter-spacing: 0.02em;
  line-height: 1;
  max-width: 100%;
  place-items: center;
  position: relative;
  text-transform: uppercase;

  @media (max-width: 1024px) {
    width: 100%;
  }

  > {
    span {
      @media (max-width: 1024px) {
        &:first-of-type {
          width: 45px;
        }

        &:last-of-type {
          position: absolute;
          right: 0;
        }
      }
    }

    div {
      display: inherit;
      gap: inherit;
      place-content: inherit;

      @media (max-width: 1024px) {
        max-width: 70%;
        overflow: overlay;
        padding: 0.5rem 0;
      }
    }
  }
`
