import dynamic from 'next/dynamic'

export const MenuOutlined = dynamic(
  () => import('@ant-design/icons/MenuOutlined')
)

export const ReloadOutlined = dynamic(
  () => import('@ant-design/icons/ReloadOutlined')
)
