import type ILayout from 'antd/lib/layout'
import type SelectInterface from 'antd/lib/select'
import dynamic from 'next/dynamic'

export const MenuOutlined = dynamic(
  () =>
    import(
      /* webpackChunkName: "antd-icons[request]" */
      '@ant-design/icons/MenuOutlined'
    )
)

export const ReloadOutlined = dynamic(
  () =>
    import(
      /* webpackChunkName: "antd-icons[request]" */
      '@ant-design/icons/ReloadOutlined'
    )
)

export const Button = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/button')
)
export const Result = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/result')
)
export const Skeleton = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/skeleton')
)
export const Space = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/space')
)
export const Spin = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/spin')
)
export const Tag = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/tag')
)
export const Drawer = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/drawer')
)
export const Text = dynamic(
  () =>
    import(/* webpackChunkName: "antd[request]" */ 'antd/lib/typography/Text')
)
export const Card = dynamic(
  () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/card')
)

export const Layout = new Proxy(
  dynamic(
    () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/layout')
  ),
  {
    get(o, k) {
      if (typeof k === 'string' && /^[A-Z]/.test(`${k}`)) {
        o[k] = dynamic(() =>
          import(
            /* webpackChunkName: "antd[request]" */ 'antd/lib/layout'
          ).then(m => m.default[k])
        )
      }

      return o[k]
    }
  }
) as typeof ILayout

export const Select = new Proxy(
  dynamic(
    () => import(/* webpackChunkName: "antd[request]" */ 'antd/lib/select')
  ),
  {
    get(o, k) {
      if (typeof k === 'string' && /^[A-Z]/.test(`${k}`)) {
        o[k] = dynamic(() =>
          import(
            /* webpackChunkName: "antd[request]" */ 'antd/lib/select'
          ).then(m => m.default[k])
        )
      }

      return o[k]
    }
  }
) as typeof SelectInterface
