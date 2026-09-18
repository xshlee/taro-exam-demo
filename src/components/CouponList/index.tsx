import { forwardRef } from 'react'
import { ScrollView, View } from '@tarojs/components'
import type { ComponentType } from 'react'
import type {
  CouponImageLayout,
  CouponItem,
  CouponLayoutHandler,
} from '../../types/coupon'
import CouponCard from '../CouponCard'
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

interface CouponListProps {
  coupons: CouponItem[]
  flashOn?: boolean
  claimingId?: string | null
  scrollIntoView?: string
  onClaim?: (item: CouponItem) => void
  onImageLayout?: CouponLayoutHandler
  onCardLayout?: CouponLayoutHandler
  onMainLayout?: CouponLayoutHandler
  onActionLayout?: CouponLayoutHandler
  onButtonLayout?: CouponLayoutHandler
  onListLayout?: (layout: CouponImageLayout) => void
  onScrollOffsetChange?: (offset: number) => void
  onScrollSettled?: () => void
}

function CouponList(
  {
    coupons,
    flashOn,
    claimingId,
    scrollIntoView,
    onClaim,
    onImageLayout,
    onCardLayout,
    onMainLayout,
    onActionLayout,
    onButtonLayout,
    onListLayout,
    onScrollOffsetChange,
    onScrollSettled,
  }: CouponListProps,
  ref: React.Ref<any>
) {
  return (
    <LayoutView
      className='coupon-list-layout'
      onLayout={(event) => onListLayout?.(event.nativeEvent.layout)}
    >
      <ScrollView
        ref={ref}
        scrollY
        scrollWithAnimation
        scrollIntoView={scrollIntoView}
        className='coupon-list'
        onScroll={(event) => {
          onScrollOffsetChange?.(event.detail.scrollTop)
          onScrollSettled?.()
        }}
      >
        {coupons.map((item) => (
          <CouponCard
            key={item.id}
            item={item}
            flashOn={flashOn}
            claimingId={claimingId}
            onClaim={onClaim}
            onImageLayout={onImageLayout}
            onCardLayout={onCardLayout}
            onMainLayout={onMainLayout}
            onActionLayout={onActionLayout}
            onButtonLayout={onButtonLayout}
          />
        ))}
        <View id='coupon-list-bottom' className='coupon-list__safe-area' />
      </ScrollView>
    </LayoutView>
  )
}

export default forwardRef(CouponList)
