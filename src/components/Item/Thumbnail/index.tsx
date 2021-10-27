import * as React from 'react'
import StyledThumbnail from './style'

export const Thumbnail: React.FC<{ src: string }> = ({ src }) => (
  <StyledThumbnail>
    <img alt="" {...{ src }} />
  </StyledThumbnail>
)
