import * as React from 'react'
import {
  Button,
  Drawer,
  MenuOutlined,
  Select,
  Space,
  Tag
} from '~/components/antd'
import { BrandContext } from '~/ctx'

const Form: React.FC = () => {
  const ctx = React.useContext(BrandContext)
  const slugs = [...ctx.slugs.entries()]
  const [visible, set] = React.useState(() => false)

  const toggle = () => set(st => !st)

  return (
    <React.Suspense fallback={null}>
      <Button
        icon={<MenuOutlined />}
        onPointerDown={toggle}
        style={{
          inset: 'calc(var(--pad) / 2) calc(var(--pad) / 2) auto auto',
          position: 'fixed',
          zIndex: 1e3 + 1
        }}
      />

      <Drawer
        closable={false}
        footer={
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Select
              defaultValue={ctx.sortBy}
              onChange={e => ctx.setState(s => ({ ...s, sortBy: e }))}
              placeholder="Sort By"
              style={{ width: 120 }}>
              {['price', 'updated_at', 'created_at', 'published_at'].map(i => (
                <Select.Option key={i} value={i}>
                  {`${i}`
                    .toLocaleLowerCase()
                    .replace(/_|-/g, ' ')
                    .split(' ')
                    .shift()}
                </Select.Option>
              ))}
            </Select>
          </Space>
        }
        height={140}
        mask={false}
        onClose={toggle}
        placement="top"
        style={{
          inset: '0 0 auto',
          width: 'auto'
        }}
        {...{ visible }}>
        <Select
          allowClear
          autoFocus
          bordered={false}
          defaultValue={slugs
            .map<string>(([k, v]) => (v ? k : ''))
            .filter(v => v)}
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
    </React.Suspense>
  )
}

export default Form
