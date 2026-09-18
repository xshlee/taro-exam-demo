export type CouponStatus = 'available' | 'claimed' | 'unavailable'

export interface CouponTag {
  text: string
  color?: string
  bgColor?: string
}

export interface CouponItem {
  id: string
  title: string
  subtitle?: string
  priceText: string
  validity: string
  image?: string
  tags?: CouponTag[]
  status: CouponStatus
  reason?: string
  isPackage?: boolean
  packageCount?: number
  isNew?: boolean
}

export interface Point {
  x: number
  y: number
}

export interface CouponImageLayout {
  x: number
  y: number
  width: number
  height: number
}

export type CouponLayoutHandler = (
  couponId: string,
  layout: CouponImageLayout
) => void

export interface CouponLayoutSnapshot {
  sheet: CouponImageLayout | null
  list: CouponImageLayout | null
  cards: Record<string, CouponImageLayout>
  mains: Record<string, CouponImageLayout>
  actions: Record<string, CouponImageLayout>
  images: Record<string, CouponImageLayout>
  buttons: Record<string, CouponImageLayout>
  scrollOffset: number
}

export interface FlyingPacket {
  id: string
  targetCouponId: string
  progress: number
  start: Point
  end: Point
  control: Point
}
