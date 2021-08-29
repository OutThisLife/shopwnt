import styled from 'styled-components'

export default styled.form`
  background: #fff;
  border: 0;
  box-shadow: 0 0 20px #00000055;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;

  fieldset {
    border: 0;
    display: flex;
    flex-direction: row;
    place-content: space-evenly;
    place-items: center;
    gap: 0.5em;
  }

  label {
    display: inherit;
    gap: inherit;
    place-items: center;
  }

  input {
    border: 1px solid hsla(0, 0%, 0%, 0.25);
    padding: 0.1em;
  }
`
