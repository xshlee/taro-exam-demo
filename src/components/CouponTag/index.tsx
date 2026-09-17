import { Text } from '@tarojs/components'
import type { CouponTag as CouponTagType } from '../../types/coupon'
import './index.scss'

interface CouponTagProps extends CouponTagType {}

export default function CouponTag({
  text,
  color = '#ff4d4f',
  bgColor = '#fff2f0',
}: CouponTagProps) {
  return (
    <Text
      className='coupon-tag'
      style={{ color, backgroundColor: bgColor }}
    >
      {text}
    </Text>
  )
}
