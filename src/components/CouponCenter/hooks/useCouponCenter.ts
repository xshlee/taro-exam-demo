import { useState, useCallback, useMemo } from 'react'
import type { CouponItem } from '../../../types/coupon'

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
    tags: [{ text: '新品尝鲜', color: '#ff4d4f', bgColor: '#fff2f0' }],
    status: 'claimed',
    reason: '规则说明：今日剩余3次；每周三可用',
    isNew: true,
  }))
}

export type AnimationPhase =
  | 'idle'
  | 'claiming'
  | 'exploding'
  | 'landed'
  | 'flashing'
  | 'done'

export function useCouponCenter() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS)
  const [phase, setPhase] = useState<AnimationPhase>('idle')

  const reset = useCallback(() => {
    setCoupons(INITIAL_COUPONS)
    setPhase('idle')
  }, [])

  const claimPackage = useCallback(
    (packageId: string) => {
      if (phase !== 'idle' && phase !== 'done') return
      setPhase('claiming')
      const newCoupons = generateNewCoupons(packageId)
      setCoupons((prev) => {
        const index = prev.findIndex((c) => c.id === packageId)
        const next = [...prev]
        next.splice(index + 1, 0, ...newCoupons)
        return next
      })
      return newCoupons
    },
    [phase]
  )

  const footerText = useMemo(() => {
    if (phase === 'claiming' || phase === 'exploding') return '领券中...'
    if (phase === 'done' || phase === 'flashing' || phase === 'landed') return '再看一次'
    return '一键领券'
  }, [phase])

  return {
    coupons,
    phase,
    footerText,
    reset,
    claimPackage,
    setPhase,
  }
}
