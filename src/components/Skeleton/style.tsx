import ContentLoader from 'react-content-loader'
import styled from 'styled-components'
import type { SkeletonProps } from '.'

export default styled(ContentLoader)<SkeletonProps>`
  display: block;
  height: auto;
  margin: auto;
  width: 80%;

  stop {
    --fg-lum: 90;

    &:nth-of-type(2) {
      --fg-lum: 100;
    }

    stop-color: var(--fg) !important;
  }
`
