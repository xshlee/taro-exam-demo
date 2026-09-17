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

export interface FlyingPacket {
  id: string
  targetCouponId: string
  progress: number
  start: Point
  end: Point
  control: Point
}
