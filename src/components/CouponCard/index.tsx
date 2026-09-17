import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { View, Text } from '@tarojs/components'
import type { CouponItem } from '../../types/coupon'
import CouponTag from '../CouponTag'
import './index.scss'

export interface CouponCardRef {
  id: string
  getImageRef: () => ReturnType<typeof useRef<typeof View>>
}

interface CouponCardProps {
  item: CouponItem
  flashOn?: boolean
  claimingId?: string | null
  onClaim?: (item: CouponItem) => void
}

function CouponCard(
  { item, flashOn = true, claimingId, onClaim }: CouponCardProps,
  ref: React.Ref<CouponCardRef>
) {
  const imageRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    id: item.id,
    getImageRef: () => imageRef,
  }))

  const isClaimed = item.status === 'claimed'
  const isUnavailable = item.status === 'unavailable'
  const isClaiming = claimingId === item.id

  return (
    <View
      className={`coupon-card ${item.isNew && flashOn ? 'coupon-card--new' : ''} ${
        item.isPackage ? 'coupon-card--package' : ''
      }`}
    >
      <View
        ref={imageRef}
        id={`coupon-img-${item.id}`}
        className='coupon-card__image'
      >
        <Text className='coupon-card__image-text'>🍔</Text>
      </View>

      <View className='coupon-card__content'>
        {item.tags && item.tags.length > 0 && (
          <View className='coupon-card__tags'>
            {item.tags.map((tag) => (
              <CouponTag key={tag.text} {...tag} />
            ))}
          </View>
        )}

        <Text className='coupon-card__title'>{item.title}</Text>
        {item.subtitle && !item.isPackage && (
          <Text className='coupon-card__subtitle'>{item.subtitle}</Text>
        )}

        {item.isPackage ? (
          <Text className='coupon-card__package-subtitle'>
            {item.subtitle}
          </Text>
        ) : (
          <Text
            className={`coupon-card__price ${
              isClaimed || isUnavailable ? 'coupon-card__price--disabled' : ''
            }`}
          >
            {item.priceText}
          </Text>
        )}

        {!item.isPackage && (
          <Text className='coupon-card__validity'>{item.validity}</Text>
        )}
        {item.reason && (
          <Text className='coupon-card__reason'>{item.reason}</Text>
        )}
      </View>

      <View
        className={`coupon-card__action ${
          item.isPackage ? 'coupon-card__action--package' : ''
        }`}
      >
        {item.status === 'available' && (
          <View
            id={`claim-btn-${item.id}`}
            className='coupon-card__btn coupon-card__btn--claim'
            onClick={isClaiming ? undefined : () => onClaim?.(item)}
          >
            {isClaiming ? '领券中...' : '领券'}
          </View>
        )}
        {isClaimed && (
          <View className='coupon-card__btn coupon-card__btn--use'>
            立即使用
          </View>
        )}
        {isUnavailable && (
          <View className='coupon-card__btn coupon-card__btn--disabled'>
            不可用
          </View>
        )}
      </View>

      {isClaimed && (
        <View className='coupon-card__watermark-wrap'>
          <View className='coupon-card__watermark'>
            <Text className='coupon-card__watermark-text'>已领取</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default forwardRef(CouponCard)
