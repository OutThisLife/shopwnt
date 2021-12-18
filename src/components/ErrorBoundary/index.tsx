/* eslint-disable react/state-in-constructor */
import * as React from 'react'
import StyledEB from './style'

const nonProd = process.env.NODE_ENV !== 'production'

export class ErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = {}

  static getDerivedStateFromError(err: EBState['err']): Partial<EBState> {
    return { err }
  }

  render(): React.ReactNode {
    const { err } = this.state
    const { children, onError } = this.props

    if (err?.message && err?.stack) {
      if (onError) {
        onError(this.state, this.props)
      }

      if (nonProd) {
        return (
          <StyledEB>
            <p>{err.message}</p>
            <p>{err.stack}</p>
          </StyledEB>
        )
      }

      return null
    }

    return children
  }
}

export interface EBState {
  err?: Error | null
}

export interface EBProps {
  onError?: (s: EBState, p?: EBProps) => void
}

export default ErrorBoundary
