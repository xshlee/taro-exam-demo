import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { View, Text } from '@tarojs/components'
import type { ComponentType } from 'react'
import type { CouponImageLayout, CouponItem, CouponLayoutHandler } from '../../types/coupon'
import CouponTag from '../CouponTag'
import './index.scss'

interface LayoutEvent {
  nativeEvent: {
    layout: CouponImageLayout
  }
}

type LayoutViewProps = React.ComponentProps<typeof View> & {
  onLayout?: (event: LayoutEvent) => void
}

const LayoutView = View as ComponentType<LayoutViewProps>

export interface CouponCardRef {
  id: string
  getImageRef: () => ReturnType<typeof useRef<typeof View>>
}

interface CouponCardProps {
  item: CouponItem
  flashOn?: boolean
  claimingId?: string | null
  onClaim?: (item: CouponItem) => void
  onImageLayout?: CouponLayoutHandler
  onCardLayout?: CouponLayoutHandler
  onMainLayout?: CouponLayoutHandler
  onActionLayout?: CouponLayoutHandler
  onButtonLayout?: CouponLayoutHandler
}

function CouponCard(
  {
    item,
    flashOn = true,
    claimingId,
    onClaim,
    onImageLayout,
    onCardLayout,
    onMainLayout,
    onActionLayout,
    onButtonLayout,
  }: CouponCardProps,
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
    <LayoutView
      className={`coupon-card ${item.isNew && flashOn ? 'coupon-card--new' : ''} ${
        item.isPackage ? 'coupon-card--package' : ''
      }`}
      onLayout={(event) => onCardLayout?.(item.id, event.nativeEvent.layout)}
    >
      <LayoutView
        className='coupon-card__main'
        onLayout={(event) => onMainLayout?.(item.id, event.nativeEvent.layout)}
      >
        <LayoutView
          ref={imageRef}
          id={`coupon-img-${item.id}`}
          className='coupon-card__image'
          onLayout={(event) => onImageLayout?.(item.id, event.nativeEvent.layout)}
        >
          <Text className='coupon-card__image-text'>🍔</Text>
        </LayoutView>

        <View className='coupon-card__content'>
          {item.tags && item.tags.length > 0 && (
            <View className='coupon-card__tags'>
              {item.tags.map((tag) => (
                <CouponTag key={tag.text} {...tag} />
              ))}
            </View>
          )}

          <Text className='coupon-card__title' numberOfLines={2}>
            {item.title}
          </Text>
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
        </View>

        <LayoutView
          className={`coupon-card__action ${
            item.isPackage ? 'coupon-card__action--package' : ''
          }`}
          onLayout={(event) =>
            onActionLayout?.(item.id, event.nativeEvent.layout)
          }
        >
          {item.status === 'available' && (
            <LayoutView
              id={`claim-btn-${item.id}`}
              className='coupon-card__btn coupon-card__btn--claim'
              onLayout={(event) =>
                onButtonLayout?.(item.id, event.nativeEvent.layout)
              }
              onClick={
                item.isPackage && !isClaiming ? () => onClaim?.(item) : undefined
              }
            >
              {isClaiming ? '领券中...' : '领券'}
            </LayoutView>
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
        </LayoutView>

        {isClaimed && (
          <View className='coupon-card__watermark-wrap'>
            <View className='coupon-card__watermark'>
              <Text className='coupon-card__watermark-text'>已领取</Text>
            </View>
          </View>
        )}
      </LayoutView>

      {item.reason && (
        <View className='coupon-card__rule'>
          <Text className='coupon-card__reason' numberOfLines={1}>
            {item.reason}
          </Text>
        </View>
      )}
    </LayoutView>
  )
}

export default forwardRef(CouponCard)
