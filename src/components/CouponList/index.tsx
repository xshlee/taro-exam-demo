import { forwardRef } from 'react'
import { ScrollView, View } from '@tarojs/components'
import type { CouponItem } from '../../types/coupon'
import CouponCard from '../CouponCard'
import './index.scss'

interface CouponListProps {
  coupons: CouponItem[]
  flashOn?: boolean
  claimingId?: string | null
  scrollIntoView?: string
  onClaim?: (item: CouponItem) => void
}

function CouponList(
  { coupons, flashOn, claimingId, scrollIntoView, onClaim }: CouponListProps,
  ref: React.Ref<any>
) {
  return (
    <ScrollView
      ref={ref}
      scrollY
      scrollWithAnimation
      scrollIntoView={scrollIntoView}
      className='coupon-list'
    >
      {coupons.map((item) => (
        <CouponCard
          key={item.id}
          item={item}
          flashOn={flashOn}
          claimingId={claimingId}
          onClaim={onClaim}
        />
      ))}
      <View id='coupon-list-bottom' className='coupon-list__safe-area' />
    </ScrollView>
  )
}

export default forwardRef(CouponList)
