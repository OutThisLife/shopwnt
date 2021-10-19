import dynamic from 'next/dynamic'
import styled from 'styled-components'

const Card = dynamic(() => import('antd/lib/card'))

export default styled(Card)`
  content-visibility: auto;
  user-select: none;

  .ant-card-body {
    display: flex;
    max-width: 100%;
    overflow: overlay;
    width: 100%;

    &:before,
    &:after {
      content: none;
    }

    ::-webkit-scrollbar {
      height: 2px;
      width: 2px;
    }

    ::-webkit-scrollbar-thumb {
      background: currentColor;
    }

    > * {
      flex: auto 0 0;
    }

    .ant-card-loading-content {
      flex: 100% 0 0;
    }
  }
`
