import { useState, useCallback, useMemo, useEffect } from 'react'
import type { CouponItem } from '../../../types/coupon'
import { useAnimation } from './useAnimation'
import { useMeasurements } from './useMeasurements'

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

export function useCouponCenter() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS)
  const [toast, setToast] = useState<string | null>(null)
  const { measure } = useMeasurements()

  const handleAnimationDone = useCallback(() => {
    setToast(null)
  }, [])

  const { state: animState, startExplosion, clear } = useAnimation(handleAnimationDone)

  const claimPackage = useCallback(
    (packageId: string) => {
      if (animState.phase !== 'idle' && animState.phase !== 'done') return
      clear()

      const newCoupons = generateNewCoupons(packageId)
      setCoupons((prev) => {
        const index = prev.findIndex((c) => c.id === packageId)
        const next = [...prev]
        next.splice(index + 1, 0, ...newCoupons)
        return next
      })

      // 等待新券渲染并测量
      setTimeout(() => {
        measure({
          packageId,
          couponIds: newCoupons.map((c) => c.id),
        }).then((targets) => {
          if (targets.length === 0) return
          setToast(`成功领取${newCoupons.length}张券`)
          startExplosion(targets)
        })
      }, 100)
    },
    [animState.phase, clear, measure, startExplosion]
  )

  // 动画结束后清除 isNew 标记
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

  const footerText = useMemo(() => {
    if (
      animState.phase === 'exploding' ||
      animState.phase === 'landed' ||
      animState.phase === 'flashing'
    )
      return '领券中...'
    if (animState.phase === 'done') return '再看一次'
    return '一键领券'
  }, [animState.phase])

  return {
    coupons,
    phase: animState.phase,
    packets: animState.packets,
    footerText,
    toast,
    claimPackage,
  }
}
