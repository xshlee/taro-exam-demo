import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import type { ComponentType } from 'react'
import CouponTabs from '../CouponTabs'
import CouponList from '../CouponList'
import RedPacket from '../RedPacket'
import { useCouponCenter } from './hooks/useCouponCenter'
import { isRN } from '../../utils/platform'
import type {
  CouponImageLayout,
  CouponItem,
  CouponLayoutSnapshot,
  FlyingPacket,
} from '../../types/coupon'
import './index.scss'

interface LayoutEvent {
  nativeEvent: {
    layout: CouponImageLayout
  }
}

type LayoutViewProps = React.ComponentProps<typeof View> & {
  onLayout?: (event: LayoutEvent) => void
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only'
}

const LayoutView = View as ComponentType<LayoutViewProps>

interface CouponCenterProps {
  visible: boolean
  onClose: () => void
}

interface CouponSheetProps {
  coupons: CouponItem[]
  packets: FlyingPacket[]
  flashOn: boolean
  claimingId: string | null
  toast: string | null
  onClaim: (
    id: string,
    getSnapshot: () => CouponLayoutSnapshot,
    waitForScrollSettled: () => Promise<void>
  ) => void
  onClose: () => void
}

function CouponSheet({
  coupons,
  packets,
  flashOn,
  claimingId,
  toast,
  onClaim,
  onClose,
}: CouponSheetProps) {
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [scrollTarget, setScrollTarget] = useState('')
  const firstRenderRef = useRef(true)
  const sheetLayoutRef = useRef<CouponImageLayout | null>(null)
  const listLayoutRef = useRef<CouponImageLayout | null>(null)
  const cardLayoutsRef = useRef<Record<string, CouponImageLayout>>({})
  const mainLayoutsRef = useRef<Record<string, CouponImageLayout>>({})
  const actionLayoutsRef = useRef<Record<string, CouponImageLayout>>({})
  const imageLayoutsRef = useRef<Record<string, CouponImageLayout>>({})
  const buttonLayoutsRef = useRef<Record<string, CouponImageLayout>>({})
  const scrollOffsetRef = useRef(0)
  const scrollSettledWaitersRef = useRef<Array<() => void>>([])
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const waitForScrollSettled = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (!scrollTimerRef.current) {
          resolve()
          return
        }
        scrollSettledWaitersRef.current.push(resolve)
      }),
    []
  )

  const notifyScroll = useCallback((offset: number) => {
    scrollOffsetRef.current = offset
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      scrollTimerRef.current = null
      const waiters = scrollSettledWaitersRef.current.splice(0)
      waiters.forEach((resolve) => resolve())
    }, 80)
  }, [])

  const layoutSnapshot = useCallback((): CouponLayoutSnapshot => ({
    sheet: sheetLayoutRef.current,
    list: listLayoutRef.current,
    cards: cardLayoutsRef.current,
    mains: mainLayoutsRef.current,
    actions: actionLayoutsRef.current,
    images: imageLayoutsRef.current,
    buttons: buttonLayoutsRef.current,
    scrollOffset: scrollOffsetRef.current,
  }), [])

  // 挂载后下一帧移除 hidden 态，触发滑入/淡入过渡
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 30)
    return () => {
      clearTimeout(timer)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollSettledWaitersRef.current.splice(0).forEach((resolve) => resolve())
    }
  }, [])

  // 券列表变化（领券插入新卡）后滚到底部，保证最下面的卡片完整可见
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    setScrollTarget('coupon-list-bottom')
    const timer = setTimeout(() => setScrollTarget(''), 120)
    notifyScroll(scrollOffsetRef.current)
    return () => clearTimeout(timer)
  }, [coupons])

  // 关闭：先播放下滑收起动画，300ms 后再真正卸载
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(onClose, 300)
    return () => clearTimeout(timer)
  }, [leaving, onClose])

  const requestClose = useCallback(() => {
    if (isRN) {
      // RN 无 CSS transition，直接关闭
      onClose()
      return
    }
    setLeaving(true)
  }, [onClose])

  // RN 无 CSS transition，直接呈现终态（即时出现兜底）
  const shown = isRN ? true : entered && !leaving

  return (
    <View className='coupon-center'>
      <View
        className={`coupon-center__mask ${
          shown ? '' : 'coupon-center__mask--hidden'
        }`}
        onClick={requestClose}
      />
      <LayoutView
        id='coupon-center-sheet'
        onLayout={(event) => {
          sheetLayoutRef.current = event.nativeEvent.layout
        }}
        className={`coupon-center__sheet ${
          shown ? '' : 'coupon-center__sheet--hidden'
        }`}
      >
        <View className='coupon-center__header'>
          <Text className='coupon-center__title'>优惠中心</Text>
          <Text className='coupon-center__close' onClick={requestClose}>
            ×
          </Text>
        </View>
        <CouponTabs active='领券' />
        <CouponList
          coupons={coupons}
          flashOn={flashOn}
          claimingId={claimingId}
          scrollIntoView={scrollTarget}
          onClaim={(item) =>
            onClaim(item.id, layoutSnapshot, waitForScrollSettled)
          }
          onListLayout={(layout) => {
            listLayoutRef.current = layout
          }}
          onScrollOffsetChange={notifyScroll}
          onScrollSettled={() => undefined}
          onCardLayout={(id, layout) => {
            cardLayoutsRef.current[id] = layout
          }}
          onMainLayout={(id, layout) => {
            mainLayoutsRef.current[id] = layout
          }}
          onActionLayout={(id, layout) => {
            actionLayoutsRef.current[id] = layout
          }}
          onImageLayout={(id, layout) => {
            imageLayoutsRef.current[id] = layout
          }}
          onButtonLayout={(id, layout) => {
            buttonLayoutsRef.current[id] = layout
          }}
        />

        {packets.length > 0 && (
          <LayoutView className='coupon-center__packets' pointerEvents='none'>
            {packets.map((packet) => (
              <RedPacket
                key={packet.id}
                packet={packet}
                progress={packet.progress}
              />
            ))}
          </LayoutView>
        )}

        {toast && (
          <LayoutView className='coupon-center__toast-wrap' pointerEvents='none'>
            <View className='coupon-center__toast'>
              <Text className='coupon-center__toast-text'>{toast}</Text>
            </View>
          </LayoutView>
        )}
      </LayoutView>
    </View>
  )
}

export default function CouponCenter({ visible, onClose }: CouponCenterProps) {
  const { coupons, packets, flashOn, claimingId, toast, claimPackage } =
    useCouponCenter()

  if (!visible) return null

  // 每次打开都重新挂载，确保滑入动画每次都播放
  return (
    <CouponSheet
      coupons={coupons}
      packets={packets}
      flashOn={flashOn}
      claimingId={claimingId}
      toast={toast}
      onClaim={claimPackage}
      onClose={onClose}
    />
  )
}
