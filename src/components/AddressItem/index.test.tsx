import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

jest.mock('./index.scss', () => ({}))

import AddressItem from './index'

jest.mock('@tarojs/components', () => {
  const react = require('react') as typeof import('react')
  const Host = ({ children, ...props }: { children?: React.ReactNode }) =>
    react.createElement('div', props, children)
  return { View: Host, Text: Host }
})

jest.mock('@tarojs/taro', () => ({
  __esModule: true,
  default: {
    createSelectorQuery: jest.fn(),
    getSystemInfoSync: jest.fn(() => ({ windowWidth: 750 })),
  },
}))

jest.mock('../Tag', () => {
  const react = require('react') as typeof import('react')
  return {
    __esModule: true,
    default: ({ text }: { text: string }) =>
      react.createElement('span', { className: 'tag' }, text),
  }
})

describe('AddressItem semantic rendering', () => {
  const base = {
    id: 'semantic-check',
    name: '张三',
    phone: '13800000000',
    tags: [],
  }

  test('keeps first-line output free of a fallback ellipsis and emits spacing', () => {
    const html = renderToStaticMarkup(
      <AddressItem {...base} address={'一'.repeat(100)} />
    )

    expect(html).not.toMatch(
      /address-item__body">[^<]*…<\/div><\/div><\/div><\/div><\/div><\/div>/
    )
    expect(html).toContain('letter-spacing:')
    expect(html).toContain('…')
  })

  test('renders the tail tag in a separate pinned row', () => {
    const html = renderToStaticMarkup(
      <AddressItem
        {...base}
        address={'一'.repeat(100)}
        endTag='04:59 后餐厅停止接单'
      />
    )

    expect(html).toContain('04:59 后餐厅停止接单')
    expect(html).toContain('address-item__end-tag')
    expect(html).toContain('address-item__ellipsis')
  })

  test('encodes special-character ids into a selector-safe content id', () => {
    const html = renderToStaticMarkup(
      <AddressItem {...base} id='x.# []' address='北京市朝阳区' />
    )

    expect(html).toMatch(/id="address-item-content-a[0-9a-f]+"/)
    expect(html).not.toContain('address-item-content-x.# []')
  })
})
