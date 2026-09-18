import type { CouponImageLayout, Point } from '../types/coupon'

function isValidLayout(layout: CouponImageLayout | null): layout is CouponImageLayout {
  return Boolean(
    layout &&
      Number.isFinite(layout.x) &&
      Number.isFinite(layout.y) &&
      Number.isFinite(layout.width) &&
      Number.isFinite(layout.height) &&
      layout.width > 0 &&
      layout.height > 0
  )
}

export function getCouponImageCenter(
  sheet: CouponImageLayout | null,
  list: CouponImageLayout | null,
  card: CouponImageLayout | null,
  main: CouponImageLayout | null,
  image: CouponImageLayout | null,
  scrollOffset: number
): Point | null {
  if (
    !isValidLayout(sheet) ||
    !isValidLayout(list) ||
    !isValidLayout(card) ||
    !isValidLayout(main) ||
    !isValidLayout(image) ||
    !Number.isFinite(scrollOffset)
  ) {
    return null
  }

  return {
    x: list.x + card.x + main.x + image.x + image.width / 2 - sheet.x,
    y:
      list.y +
      card.y +
      main.y +
      image.y +
      image.height / 2 -
      scrollOffset -
      sheet.y,
  }
}
