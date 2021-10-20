import type SelectInterface from 'antd/lib/select'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { MenuOutlined, ReloadOutlined } from '~/components/Icons'
import { BrandContext } from '~/ctx'

const Button = dynamic(() => import('antd/lib/button'))
const Drawer = dynamic(() => import('antd/lib/drawer'))
const Tag = dynamic(() => import('antd/lib/tag'))
const Space = dynamic(() => import('antd/lib/space'))
const Text = dynamic(() => import('antd/lib/typography/Text'))

const Select = new Proxy(
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

const Form: React.FC<{
  visible: boolean
  toggle(e: unknown): void
}> = ({ toggle, visible }) => {
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]

  return (
    <Drawer
      closeIcon={<MenuOutlined />}
      destroyOnClose
      footer={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Text>Sort by:</Text>

            <Select
              key="sort"
              defaultValue={ctx.sortBy}
              id="sort"
              onChange={e => ctx.setState(s => ({ ...s, sortBy: e }))}>
              {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
                <Select.Option key={i} value={i}>
                  {i
                    .toLocaleLowerCase()
                    .replace(/_|-/g, ' ')
                    .split(' ')
                    .shift()}
                </Select.Option>
              ))}
            </Select>
          </Space>

          <Button
            danger
            icon={<ReloadOutlined />}
            onClick={() =>
              navigator.serviceWorker.controller?.postMessage('all')
            }>
            Reset Cache
          </Button>
        </Space>
      }
      height={140}
      mask={false}
      onClose={toggle}
      placement="top"
      style={{
        inset: '0 calc(var(--pad) / 2) auto',
        width: 'auto'
      }}
      {...{ visible }}>
      <Select
        key="brands"
        allowClear
        bordered={false}
        defaultValue={slugs
          .map<string>(([k, v]) => (v ? k : ''))
          .filter(v => v)}
        id="brands"
        mode="tags"
        onChange={r =>
          ctx.setState(s => {
            ;[...s.slugs.keys(), ...r].forEach(k =>
              s.slugs.set(k, r.includes(k))
            )

            return { ...s, slugs: s.slugs }
          })
        }
        placeholder="Stores to watch"
        style={{ width: '95%' }}
        tagRender={({ label, ...props }) => (
          <Tag color="magenta" {...props}>
            {label}
          </Tag>
        )}>
        {slugs.map(([i]) => (
          <Select.Option key={i} value={i}>
            {i}
          </Select.Option>
        ))}
      </Select>
    </Drawer>
  )
}

export default Form
