import { useCallback, useRef, useState } from 'react'
import type { FlyingPacket } from '../../../types/coupon'
import type { MeasuredTarget } from './useMeasurements'
import { getControlPoint } from '../../../utils/bezier'
import { isRN } from '../../../utils/platform'

const DURATION = 700
const STAGGER = 80
const FLASH_INTERVAL = 200
const FLASH_COUNT = 3 // 新券高亮闪烁次数
const EASE = (t: number) => t * (2 - t) // easeOutQuad

export type AnimationPhase =
  | 'idle'
  | 'exploding'
  | 'landed'
  | 'flashing'
  | 'done'

export interface AnimationState {
  phase: AnimationPhase
  packets: FlyingPacket[]
  progress: number
  flashOn: boolean
}

export function useAnimation(onDone?: () => void) {
  const [state, setState] = useState<AnimationState>({
    phase: 'idle',
    packets: [],
    progress: 0,
    flashOn: true,
  })
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = useCallback(() => {
    if (rafRef.current && !isRN) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = null
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const startExplosion = useCallback(
    (targets: MeasuredTarget[]) => {
      clear()
      const startTime = Date.now()
      startTimeRef.current = startTime

      const packets: FlyingPacket[] = targets.map((t) => ({
        id: `packet-${t.couponId}`,
        targetCouponId: t.couponId,
        progress: 0,
        start: t.start,
        end: t.end,
        control: getControlPoint(t.start, t.end),
      }))

      setState({ phase: 'exploding', packets, progress: 0, flashOn: true })

      const tick = () => {
        const elapsed = Date.now() - startTimeRef.current
        const maxProgress = Math.min(elapsed / DURATION, 1)

        const updatedPackets = packets.map((p, index) => {
          const delay = index * STAGGER
          const localElapsed = Math.max(elapsed - delay, 0)
          const localProgress = Math.min(localElapsed / DURATION, 1)
          return { ...p, progress: EASE(localProgress) }
        })

        const allLanded = updatedPackets.every((p) => p.progress >= 1)

        if (allLanded) {
          // 红包落袋即消失，进入新券闪烁阶段（亮/灭交替 FLASH_COUNT 次）
          setState({ phase: 'landed', packets: [], progress: 1, flashOn: true })
          const total = FLASH_COUNT * 2
          for (let step = 1; step <= total; step++) {
            timersRef.current.push(
              setTimeout(() => {
                setState((prev) => ({
                  ...prev,
                  phase: 'flashing',
                  flashOn: step % 2 === 0,
                }))
              }, step * FLASH_INTERVAL)
            )
          }
          timersRef.current.push(
            setTimeout(() => {
              setState((prev) => ({ ...prev, phase: 'done', flashOn: true }))
              onDone?.()
            }, (total + 1) * FLASH_INTERVAL)
          )
          return
        }

        setState({
          phase: 'exploding',
          packets: updatedPackets,
          progress: maxProgress,
          flashOn: true,
        })
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [clear, onDone]
  )

  return { state, startExplosion, clear }
}
