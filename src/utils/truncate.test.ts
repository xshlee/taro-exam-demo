import { truncateAddress } from './truncate'

describe('truncateAddress', () => {
  const options = {
    containerWidth: 598,
    leadingWidth: 0,
    fontSize: 28,
  }

  test('短地址保持单行且不需要手动省略号', () => {
    expect(truncateAddress('城开YOYO联合办公 6楼', undefined, options)).toEqual({
      singleLine: true,
      line1: '城开YOYO联合办公 6楼',
      line2: '',
      line2Display: '',
      line2Ellipsis: false,
      line2LetterSpacing: 0,
      showEndTag: false,
    })
  })

  test('恰好填满两行时不增加省略号', () => {
    const address = '一'.repeat(42)
    const result = truncateAddress(address, undefined, options)
    expect(result.singleLine).toBe(false)
    expect(result.line1.length + result.line2.length).toBe(address.length)
    expect(result.line2Ellipsis).toBe(false)
    expect(result.line2Display).toBe(result.line2)
  })

  test('超过两行时只在第二行追加一个省略号', () => {
    const result = truncateAddress('一'.repeat(100), undefined, options)
    expect(result.singleLine).toBe(false)
    expect(result.line2Ellipsis).toBe(true)
    expect(result.line2Display.endsWith('…')).toBe(true)
    expect(result.line2Display.endsWith('……')).toBe(false)
  })

  test('尾标签存在时保留尾标签并限制到容器一半', () => {
    const result = truncateAddress('一'.repeat(100), '04:59 后餐厅停止接单', options)
    expect(result.showEndTag).toBe(true)
    expect(result.line2Ellipsis).toBe(false)
  })
})
