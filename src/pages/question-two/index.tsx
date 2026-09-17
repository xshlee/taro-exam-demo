import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import CouponCenter from '../../components/CouponCenter'
import './index.scss'

export default function Index() {
  const [visible, setVisible] = useState(false)

  return (
    <View className='question-two-page'>
      <View className='coupon-entry' onClick={() => setVisible(true)}>
        <Text className='coupon-entry__text'>优惠中心</Text>
      </View>
      <CouponCenter visible={visible} onClose={() => setVisible(false)} />
    </View>
  )
}
