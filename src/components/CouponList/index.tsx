import { forwardRef } from 'react'
import { ScrollView, View } from '@tarojs/components'
import type { CouponItem } from '../../types/coupon'
import CouponCard from '../CouponCard'
import './index.scss'

interface CouponListProps {
  coupons: CouponItem[]
  onClaim?: (item: CouponItem) => void
}

function CouponList(
  { coupons, onClaim }: CouponListProps,
  ref: React.Ref<any>
) {
  return (
    <ScrollView ref={ref} scrollY className='coupon-list'>
      {coupons.map((item) => (
        <CouponCard key={item.id} item={item} onClaim={onClaim} />
      ))}
      <View className='coupon-list__safe-area' />
    </ScrollView>
  )
}

export default forwardRef(CouponList)
