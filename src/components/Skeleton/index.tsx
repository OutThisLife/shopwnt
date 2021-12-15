import type { IContentLoaderProps } from 'react-content-loader'
import StyledSkeleton from './style'

export default function Skeleton(props: SkeletonProps) {
  return (
    <StyledSkeleton
      gradientRatio={0.25}
      preserveAspectRatio="xMinYMin meet"
      speed={2}
      viewBox="0 0 476 124"
      {...props}>
      <rect height="6" rx="3" ry="3" width="88" x="48" y="8" />
      <rect height="6" rx="3" ry="3" width="52" x="48" y="26" />
      <rect height="6" rx="3" ry="3" width="410" x="0" y="56" />
      <rect height="6" rx="3" ry="3" width="380" x="0" y="72" />
      <rect height="6" rx="3" ry="3" width="178" x="0" y="88" />
      <circle cx="20" cy="20" r="20" />
    </StyledSkeleton>
  )
}

Skeleton.displayName = 'Skeleton'

export interface SkeletonProps extends IContentLoaderProps {
  a?: boolean
}
