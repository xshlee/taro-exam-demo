import { View, Text } from '@tarojs/components'
import './index.scss'

interface CouponTabsProps {
  active?: string
}

const TABS = ['我的优惠券', '付费会员', '代金券', '领券']

export default function CouponTabs({ active = '领券' }: CouponTabsProps) {
  return (
    <View className='coupon-tabs'>
      {TABS.map((tab) => (
        <View
          key={tab}
          className={`coupon-tabs__item ${
            tab === active ? 'coupon-tabs__item--active' : ''
          }`}
        >
          <Text className='coupon-tabs__text'>{tab}</Text>
          {tab === active && <View className='coupon-tabs__indicator' />}
        </View>
      ))}
    </View>
  )
}
