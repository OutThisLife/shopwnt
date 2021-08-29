import styled from 'styled-components'

export default styled.form`
  backdrop-filter: blur(50px) brightness(1.2) saturate(0);
  background: #ffffff99;
  border: 0;
  box-shadow: 0 0 20px #00000022;
  left: 0;
  position: sticky;
  right: 0;
  top: 0;
  z-index: 1000;

  fieldset {
    border: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: calc(var(--vsq) * 3);
    padding: 1em;
    place-content: center;
    place-items: center;
  }

  label {
    color: hsla(0, 0%, 0%, 0.5);
    display: inherit;
    font-weight: 500;
    gap: calc(var(--vsq) * 1.5);
    letter-spacing: 0.02em;
    line-height: 1;
    place-items: center;
    text-transform: uppercase;

    &:focus-within {
      color: var(--primary);

      input {
        border-color: var(--primary);
      }
    }

    input {
      border: 1px solid hsla(0, 0%, 0%, 0.25);
      border-radius: 100em;
      font-size: max(1em, 16px);
      line-height: 0;
      padding: 0.5em 1em 0.7em;

      &:focus {
        outline: none;
      }
    }
  }

  button {
    position: absolute;
    visibility: hidden;
  }
`
