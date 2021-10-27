import styled from 'styled-components'

export default styled.picture`
  display: block;
  height: 0;
  overflow: hidden;
  padding-top: 145%;
  position: relative;
  width: calc(var(--vsq) * 20);

  img {
    left: 0;
    object-fit: cover;
    object-position: center top;
    position: absolute;
    top: 0;
  }
`
