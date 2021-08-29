import styled from 'styled-components'

export default styled.form`
  backdrop-filter: blur(50px) brightness(1.2) saturate(0);
  background: #ffffff99;
  border: 0;
  box-shadow: 0 0 20px #00000022;
  left: 0;
  overflow: hidden;
  position: sticky;
  right: 0;
  top: 0;
  user-select: none;
  z-index: 1000;

  fieldset {
    all: unset;
    border: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    place-content: center;
    padding: 1rem;
    place-items: center;

    @media (min-width: 1024px) {
      gap: calc(var(--vsq) * 3);
    }
  }

  [type='submit'] {
    position: absolute;
    visibility: hidden;
  }
`
