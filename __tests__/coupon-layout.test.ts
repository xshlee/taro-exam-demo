import { getCouponImageCenter } from '../src/utils/coupon-layout'

describe('getCouponImageCenter', () => {
  const sheet = { x: 24, y: 160, width: 702, height: 900 }
  const list = { x: 0, y: 88, width: 702, height: 600 }
  const card = { x: 0, y: 320, width: 702, height: 180 }
  const main = { x: 0, y: 0, width: 702, height: 180 }
  const image = { x: 24, y: 20, width: 140, height: 140 }

  it('composes nested layouts and scroll offset into sheet coordinates', () => {
    expect(getCouponImageCenter(sheet, list, card, main, image, 96)).toEqual({
      x: 70,
      y: 242,
    })
  })

  it('uses the final scroll offset after the list settles', () => {
    const beforeScroll = getCouponImageCenter(
      sheet,
      list,
      card,
      main,
      image,
      96
    )
    const afterScroll = getCouponImageCenter(
      sheet,
      list,
      card,
      main,
      image,
      196
    )

    expect(afterScroll).toEqual({ x: 70, y: 142 })
    expect(afterScroll?.y).not.toBe(beforeScroll?.y)
  })

  it('returns null when a required layout is missing or invalid', () => {
    expect(getCouponImageCenter(null, list, card, main, image, 0)).toBeNull()
  })
})
