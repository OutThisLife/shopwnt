import styled from 'styled-components'

export default styled.div`
  backdrop-filter: blur(5px);
  background: #fff;
  box-shadow: 0 0 5px #0000000d;
  padding: 1em;
  position: absolute;
  text-align: left;
  z-index: 999;

  p {
    font-family: monospace;
    font-size: 11px;

    &:first-child {
      color: #000;
    }
  }
`
