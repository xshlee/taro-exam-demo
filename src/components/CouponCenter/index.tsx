import { View, Text } from '@tarojs/components'
import CouponTabs from '../CouponTabs'
import CouponList from '../CouponList'
import { useCouponCenter } from './hooks/useCouponCenter'
import './index.scss'

interface CouponCenterProps {
  visible: boolean
  onClose: () => void
}

export default function CouponCenter({ visible, onClose }: CouponCenterProps) {
  const { coupons, footerText } = useCouponCenter()

  if (!visible) return null

  return (
    <View className='coupon-center'>
      <View className='coupon-center__mask' onClick={onClose} />
      <View className='coupon-center__sheet'>
        <View className='coupon-center__header'>
          <Text className='coupon-center__title'>优惠中心</Text>
          <Text className='coupon-center__close' onClick={onClose}>
            ×
          </Text>
        </View>
        <CouponTabs active='领券' />
        <CouponList coupons={coupons} />
        <View className='coupon-center__footer'>
          <Text className='coupon-center__footer-text'>{footerText}</Text>
        </View>
      </View>
    </View>
  )
}
