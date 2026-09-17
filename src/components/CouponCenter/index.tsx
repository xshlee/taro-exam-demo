import { View, Text } from '@tarojs/components'
import CouponTabs from '../CouponTabs'
import CouponList from '../CouponList'
import RedPacket from '../RedPacket'
import { useCouponCenter } from './hooks/useCouponCenter'
import './index.scss'

interface CouponCenterProps {
  visible: boolean
  onClose: () => void
}

export default function CouponCenter({ visible, onClose }: CouponCenterProps) {
  const { coupons, packets, flashOn, claimingId, footerText, toast, claimPackage } =
    useCouponCenter()

  if (!visible) return null

  return (
    <View className='coupon-center'>
      <View className='coupon-center__mask' onClick={onClose} />
      <View id='coupon-center-sheet' className='coupon-center__sheet'>
        <View className='coupon-center__header'>
          <Text className='coupon-center__title'>优惠中心</Text>
          <Text className='coupon-center__close' onClick={onClose}>
            ×
          </Text>
        </View>
        <CouponTabs active='领券' />
        <CouponList
          coupons={coupons}
          flashOn={flashOn}
          claimingId={claimingId}
          onClaim={(item) => claimPackage(item.id)}
        />
        <View className='coupon-center__footer'>
          <Text className='coupon-center__footer-text'>{footerText}</Text>
        </View>

        {packets.length > 0 && (
          <View className='coupon-center__packets'>
            {packets.map((packet) => (
              <RedPacket
                key={packet.id}
                packet={packet}
                progress={packet.progress}
              />
            ))}
          </View>
        )}

        {toast && (
          <View className='coupon-center__toast-wrap'>
            <View className='coupon-center__toast'>
              <Text className='coupon-center__toast-text'>{toast}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
