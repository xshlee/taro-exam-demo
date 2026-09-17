import Taro from '@tarojs/taro'
import type { Point } from '../../../types/coupon'
import { isRN } from '../../../utils/platform'

export interface PositionInput {
  packageId: string
  couponIds: string[]
}

export interface MeasuredTarget {
  couponId: string
  start: Point
  end: Point
}

export function useMeasurements() {
  const measureWeb = (input: PositionInput): Promise<MeasuredTarget[]> => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query.select(`#coupon-center-sheet`).boundingClientRect()
      query.select(`#claim-btn-${input.packageId}`).boundingClientRect()
      input.couponIds.forEach((id) => {
        query.select(`#coupon-img-${id}`).boundingClientRect()
      })
      query.exec((rects) => {
        const [sheet, btn, ...imgRects] = rects as Taro.NodesRef.BoundingClientRectCallbackResult[]
        if (!sheet || !btn) {
          resolve([])
          return
        }
        const start: Point = {
          x: btn.left + btn.width / 2 - sheet.left,
          y: btn.top + btn.height / 2 - sheet.top,
        }
        const results: MeasuredTarget[] = []
        input.couponIds.forEach((id, index) => {
          const img = imgRects[index]
          if (!img) return
          results.push({
            couponId: id,
            start,
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

  const measureRN = async (input: PositionInput): Promise<MeasuredTarget[]> => {
    // RN 兜底：基于标准 375dp 屏宽估算位置，1rpx ≈ 0.5dp
    const rpx = (v: number) => v * 0.5
    const start: Point = { x: 300, y: 240 }
    return input.couponIds.map((id, index) => ({
      couponId: id,
      start,
      end: {
        x: rpx(90),
        y: rpx(260 + index * 200 + 70),
      },
    }))
  }

  const measure = (input: PositionInput): Promise<MeasuredTarget[]> => {
    return isRN ? measureRN(input) : measureWeb(input)
  }

  return { measure }
}
