import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import CouponTabs from '../CouponTabs'
import CouponList from '../CouponList'
import RedPacket from '../RedPacket'
import { useCouponCenter } from './hooks/useCouponCenter'
import { isRN } from '../../utils/platform'
import type { CouponItem, FlyingPacket } from '../../types/coupon'
import './index.scss'

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
  onClaim: (id: string) => void
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

  // 挂载后下一帧移除 hidden 态，触发滑入/淡入过渡
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 30)
    return () => clearTimeout(timer)
  }, [])

  // 券列表变化（领券插入新卡）后滚到底部，保证最下面的卡片完整可见
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    setScrollTarget('coupon-list-bottom')
    const timer = setTimeout(() => setScrollTarget(''), 50)
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
      <View
        id='coupon-center-sheet'
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
          onClaim={(item) => onClaim(item.id)}
        />

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
