import Taro from '@tarojs/taro'
import type { Point } from '../../../types/coupon'
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
  // 券包按钮中心（相对浮层），需在券包卡片移除前测量
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

  // 新券图中心（相对浮层），需在新券渲染后测量
  const measureEndsWeb = (couponIds: string[]): Promise<MeasuredEnd[]> => {
    return new Promise((resolve) => {
      const query = Taro.createSelectorQuery()
      query.select(`#coupon-center-sheet`).boundingClientRect()
      couponIds.forEach((id) => {
        query.select(`#coupon-img-${id}`).boundingClientRect()
      })
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
          if (!img) return
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

  // RN 兜底：基于标准 375dp 屏宽估算位置，1rpx ≈ 0.5dp
  const measureStartRN = async (): Promise<Point | null> => {
    return { x: 300, y: 240 }
  }

  const measureEndsRN = async (couponIds: string[]): Promise<MeasuredEnd[]> => {
    const rpx = (v: number) => v * 0.5
    return couponIds.map((id, index) => ({
      couponId: id,
      end: {
        x: rpx(90),
        y: rpx(260 + index * 200 + 70),
      },
    }))
  }

  const measureStart = (packageId: string): Promise<Point | null> => {
    return isRN ? measureStartRN() : measureStartWeb(packageId)
  }

  const measureEnds = (couponIds: string[]): Promise<MeasuredEnd[]> => {
    return isRN ? measureEndsRN(couponIds) : measureEndsWeb(couponIds)
  }

  return { measureStart, measureEnds }
}
