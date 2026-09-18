import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  CouponItem,
  CouponLayoutSnapshot,
} from '../../../types/coupon'
import { useAnimation } from './useAnimation'
import { useMeasurements } from './useMeasurements'

const CLAIM_DELAY = 2000 // 点击领取后展示「领券中...」的延时

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'c1',
    title: '美味经典芝士风情皇家卷边披萨披萨披萨',
    priceText: '39.9元',
    validity: '2025.10.29-11.29',
    status: 'available',
  },
  {
    id: 'c2',
    title: '每月领券',
    subtitle: '2张券待领取',
    priceText: '',
    validity: '',
    isPackage: true,
    packageCount: 2,
    status: 'available',
  },
  {
    id: 'c3',
    title: '香辣劲爆鸡米花小份10块',
    subtitle: '甄选白羽鸡翅尖',
    priceText: '10元',
    validity: '2025.10.29-2026.11.29',
    tags: [
      { text: 'APP专享' },
      { text: '白金会员享', color: '#d4a574', bgColor: '#fff8f0' },
    ],
    status: 'available',
  },
]

function generateNewCoupons(seedId: string): CouponItem[] {
  const count = 2 // 开发阶段固定 2 张，稳定演示
  return Array.from({ length: count }, (_, i) => ({
    id: `${seedId}-new-${Date.now()}-${i}`,
    title: '招牌香辣鸡腿堡鸡腿鸡腿鸡腿鸡腿鸡腿鸡腿',
    subtitle: '新品尝鲜',
    priceText: '19.9元',
    validity: '2025.10.29-11.29',
    status: 'claimed',
    reason: '规则说明：今日剩余3次；每周三可用',
    isNew: true,
  }))
}

export function useCouponCenter() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS)
  const [toast, setToast] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const { measureStart, measureEndsStable } = useMeasurements()
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleAnimationDone = useCallback(() => {
    setToast(null)
  }, [])

  const { state: animState, startExplosion, clear } = useAnimation(handleAnimationDone)

  const claimPackage = useCallback(
    (packageId: string, getSnapshot: () => CouponLayoutSnapshot) => {
      if (
        claimingId !== null ||
        (animState.phase !== 'idle' && animState.phase !== 'done')
      )
        return
      clear()
      // 被点击的券包按钮先显示「领券中...」，2s 后再执行后续流程
      setClaimingId(packageId)

      const newCoupons = generateNewCoupons(packageId)

      timersRef.current.push(
        setTimeout(() => {
          // 1. 先测量券包按钮起点（此时卡片还在）
          measureStart(packageId, getSnapshot()).then((start) => {
            // 2. 动画播放前就让券包卡片消失，新券插入原位置
            setCoupons((prev) => {
              const pkgIndex = prev.findIndex((c) => c.id === packageId)
              const cleaned = prev.filter(
                (c) => c.id !== packageId && !c.id.startsWith(`${packageId}-new-`)
              )
              const next = [...cleaned]
              next.splice(Math.max(pkgIndex, 0), 0, ...newCoupons)
              return next
            })

            // 3. 等待新券渲染后测量落点
            timersRef.current.push(
              setTimeout(() => {
                measureEndsStable(
                  newCoupons.map((c) => c.id),
                  getSnapshot
                ).then((ends) => {
                  setClaimingId(null)
                  if (!start || ends.length !== newCoupons.length) return
                  setToast(`成功领取${newCoupons.length}张券`)
                  startExplosion(
                    ends.map((e) => ({
                      couponId: e.couponId,
                      start,
                      end: e.end,
                    }))
                  )
                })
              }, 100)
            )
          })
        }, CLAIM_DELAY)
      )
    },
    [
      claimingId,
      animState.phase,
      clear,
      measureStart,
      measureEndsStable,
      startExplosion,
    ]
  )

  // 动画结束后延迟清除 isNew 标记
  useEffect(() => {
    if (animState.phase === 'done') {
      const timer = setTimeout(() => {
        setCoupons((prev) =>
          prev.map((c) => (c.isNew ? { ...c, isNew: false } : c))
        )
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [animState.phase])

  return {
    coupons,
    phase: animState.phase,
    packets: animState.packets,
    flashOn: animState.flashOn,
    claimingId,
    toast,
    claimPackage,
  }
}
