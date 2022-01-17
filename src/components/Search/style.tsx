import styled from 'styled-components'

export default styled.form`
  display: flex;
  inset: 0;
  overflow: hidden;
  padding: var(--pad);
  place-content: center;
  place-items: center;
  pointer-events: none;
  position: fixed;
  z-index: 1000;

  > input {
    background: var(--fg);
    border: none;
    box-shadow: inset 0 0 0 1px hsl(0, 0%, 20%);
    color: var(--bg);
    flex: 100% 0 0;
    font-size: max(16px, 3rem);
    margin-top: -25%;
    padding-inline: 0.5em;
    pointer-events: auto;

    &:hover,
    &:focus {
      color: hsla(0, 0%, 50%);

      &::placeholder {
        color: hsla(0, 0%, 50%);
      }
    }
  }
`
