import Taro from '@tarojs/taro'
import type {
  CouponLayoutSnapshot,
  Point,
} from '../../../types/coupon'
import { getCouponImageCenter } from '../../../utils/coupon-layout'
import { isRN } from '../../../utils/platform'

export interface MeasuredTarget {
  couponId: string
  start: Point
  end: Point
}

export interface MeasuredEnd {
  couponId: string
  end: Point
}

export function useMeasurements() {
  const measureStartWeb = (packageId: string): Promise<Point | null> => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query.select(`#coupon-center-sheet`).boundingClientRect()
      query.select(`#claim-btn-${packageId}`).boundingClientRect()
      query.exec((rects) => {
        const [sheet, btn] =
          rects as Taro.NodesRef.BoundingClientRectCallbackResult[]
        if (!sheet || !btn) {
          resolve(null)
          return
        }
        resolve({
          x: btn.left + btn.width / 2 - sheet.left,
          y: btn.top + btn.height / 2 - sheet.top,
        })
      })
    })
  }

  const measureEndsWeb = (couponIds: string[]): Promise<MeasuredEnd[]> => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query.select(`#coupon-center-sheet`).boundingClientRect()
      couponIds.forEach((id) => query.select(`#coupon-img-${id}`).boundingClientRect())
      query.exec((rects) => {
        const [sheet, ...imgRects] =
          rects as Taro.NodesRef.BoundingClientRectCallbackResult[]
        if (!sheet) {
          resolve([])
          return
        }
        const results: MeasuredEnd[] = []
        couponIds.forEach((id, index) => {
          const img = imgRects[index]
          if (!img || img.width <= 0 || img.height <= 0) return
          results.push({
            couponId: id,
            end: {
              x: img.left + img.width / 2 - sheet.left,
              y: img.top + img.height / 2 - sheet.top,
            },
          })
        })
        resolve(results)
      })
    })
  }

  const measureStartRN = async (
    snapshot: CouponLayoutSnapshot,
    packageId: string
  ): Promise<Point | null> => {
    const button = snapshot.buttons[packageId]
    const action = snapshot.actions[packageId]
    const main = snapshot.mains[packageId]
    const card = snapshot.cards[packageId]
    const list = snapshot.list
    const sheet = snapshot.sheet
    if (!button || !action || !main || !card || !list || !sheet) return null
    return {
      x:
        list.x +
        card.x +
        main.x +
        action.x +
        button.x +
        button.width / 2 -
        sheet.x,
      y:
        list.y +
        card.y +
        main.y +
        action.y +
        button.y +
        button.height / 2 -
        snapshot.scrollOffset -
        sheet.y,
    }
  }

  const measureEndsRN = async (
    couponIds: string[],
    snapshot: CouponLayoutSnapshot
  ): Promise<MeasuredEnd[]> => {
    if (!snapshot.sheet || !snapshot.list) return []
    return couponIds.flatMap((id) => {
      const end = getCouponImageCenter(
        snapshot.sheet,
        snapshot.list,
        snapshot.cards[id] ?? null,
        snapshot.mains[id] ?? null,
        snapshot.images[id] ?? null,
        snapshot.scrollOffset
      )
      return end ? [{ couponId: id, end }] : []
    })
  }

  const measureStart = (
    packageId: string,
    snapshot?: CouponLayoutSnapshot
  ): Promise<Point | null> =>
    isRN
      ? measureStartRN(snapshot ?? emptySnapshot(), packageId)
      : measureStartWeb(packageId)

  const measureEnds = (
    couponIds: string[],
    snapshot?: CouponLayoutSnapshot
  ): Promise<MeasuredEnd[]> =>
    isRN
      ? measureEndsRN(couponIds, snapshot ?? emptySnapshot())
      : measureEndsWeb(couponIds)

  const measureEndsStable = async (
    couponIds: string[],
    getSnapshot?: () => CouponLayoutSnapshot
  ): Promise<MeasuredEnd[]> => {
    let previous: MeasuredEnd[] = []

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const current = await measureEnds(couponIds, getSnapshot?.())
      if (
        current.length === couponIds.length &&
        previous.length === current.length &&
        current.every((target, index) =>
          isSamePoint(target.end, previous[index].end)
        )
      ) {
        return current
      }
      previous = current
      await wait(50)
    }

    return []
  }

  return { measureStart, measureEnds, measureEndsStable }
}

function isSamePoint(left: Point, right: Point): boolean {
  return Math.abs(left.x - right.x) <= 0.5 && Math.abs(left.y - right.y) <= 0.5
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function emptySnapshot(): CouponLayoutSnapshot {
  return {
    sheet: null,
    list: null,
    cards: {},
    mains: {},
    actions: {},
    images: {},
    buttons: {},
    scrollOffset: 0,
  }
}
