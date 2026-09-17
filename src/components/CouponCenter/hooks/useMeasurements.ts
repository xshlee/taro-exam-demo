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
        const results: MeasuredTarget[] = input.couponIds.map((id, index) => {
          const img = imgRects[index]
          return {
            couponId: id,
            start,
            end: {
              x: img.left + img.width / 2 - sheet.left,
              y: img.top + img.height / 2 - sheet.top,
            },
          }
        })
        resolve(results)
      })
    })
  }

  const measureRN = async (): Promise<MeasuredTarget[]> => {
    // RN 分支在 Task 10 与 RedPacket 一起实现，这里先返回空数组兜底
    return []
  }

  const measure = (input: PositionInput): Promise<MeasuredTarget[]> => {
    return isRN ? measureRN() : measureWeb(input)
  }

  return { measure }
}
