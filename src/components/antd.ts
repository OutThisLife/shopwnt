import { lazy } from 'react'

export const MenuOutlined = lazy(
  () =>
    import(
      /* webpackChunkName: "antd-icons-[request]" */
      '@ant-design/icons/MenuOutlined'
    )
)

export const ReloadOutlined = lazy(
  () =>
    import(
      /* webpackChunkName: "antd-icons-[request]" */
      '@ant-design/icons/ReloadOutlined'
    )
)

export const Button = lazy(() => import('antd/lib/button'))
export const Result = lazy(() => import('antd/lib/result'))

export { default as Layout } from 'antd/lib/layout'
export { default as Select } from 'antd/lib/select'
export { default as Skeleton } from 'antd/lib/skeleton'

export const Space = lazy(() => import('antd/lib/space'))
export const Spin = lazy(() => import('antd/lib/spin'))
export const Tag = lazy(() => import('antd/lib/tag'))
export const Drawer = lazy(() => import('antd/lib/drawer'))
export const Text = lazy(() => import('antd/lib/typography/Text'))
export const Card = lazy(() => import('antd/lib/card'))
