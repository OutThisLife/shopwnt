import type ILayout from 'antd/lib/layout'
import type SelectInterface from 'antd/lib/select'
import dynamic from 'next/dynamic'

export const Button = dynamic(() => import('antd/lib/button'))
export const Drawer = dynamic(() => import('antd/lib/drawer'))

export const MenuOutlined = dynamic(
  () => import('@ant-design/icons/MenuOutlined')
)

export const ReloadOutlined = dynamic(
  () => import('@ant-design/icons/ReloadOutlined')
)

export const Result = dynamic(() => import('antd/lib/result'), { ssr: false })
export const Skeleton = dynamic(() => import('antd/lib/skeleton'))
export const Space = dynamic(() => import('antd/lib/space'))
export const Spin = dynamic(() => import('antd/lib/spin'), { ssr: false })
export const Tag = dynamic(() => import('antd/lib/tag'))
export const Text = dynamic(() => import('antd/lib/typography/Text'))

export const Layout = new Proxy(
  dynamic(() => import('antd/lib/layout')),
  {
    get(o, k) {
      if (typeof k === 'string' && /^[A-Z]/.test(`${k}`)) {
        o[k] = dynamic(() => import('antd/lib/layout').then(m => m.default[k]))
      }

      return o[k]
    }
  }
) as typeof ILayout

export const Select = new Proxy(
  dynamic(() => import('antd/lib/select')),
  {
    get(o, k) {
      if (typeof k === 'string' && /^[A-Z]/.test(`${k}`)) {
        o[k] = dynamic(() => import('antd/lib/select').then(m => m.default[k]))
      }

      return o[k]
    }
  }
) as typeof SelectInterface
