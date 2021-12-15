import * as React from 'react'
import StyledThumbnail from './style'

export default function Thumbnail({ src = '' }): JSX.Element {
  const getSrc = (h: number) => {
    const u = new URL(src)
    u.searchParams.set('height', `${h}`)
    u.searchParams.set('format', 'webp')

    return u.toString()
  }

  return (
    <StyledThumbnail>
      <source media="(max-width: 786px)" srcSet={getSrc(400)} />
      <source media="(max-width: 1024px)" srcSet={getSrc(600)} />
      <source media="(max-width: 1440px)" srcSet={getSrc(800)} />
      <source media="(min-width: 1600px)" srcSet={getSrc(1e3)} />
      <img alt="" src={getSrc(1e3)} />
    </StyledThumbnail>
  )
}
