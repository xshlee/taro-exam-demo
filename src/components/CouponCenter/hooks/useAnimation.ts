import { useCallback, useRef, useState } from 'react'
import type { FlyingPacket } from '../../../types/coupon'
import type { MeasuredTarget } from './useMeasurements'
import { getControlPoint } from '../../../utils/bezier'
import { isRN } from '../../../utils/platform'

const DURATION = 700
const STAGGER = 80
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
}

export function useAnimation(onDone?: () => void) {
  const [state, setState] = useState<AnimationState>({
    phase: 'idle',
    packets: [],
    progress: 0,
  })
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const clear = useCallback(() => {
    if (rafRef.current && !isRN) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = null
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

      setState({ phase: 'exploding', packets, progress: 0 })

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
          setState({ phase: 'landed', packets: updatedPackets, progress: 1 })
          setTimeout(() => {
            setState((prev) => ({ ...prev, phase: 'flashing' }))
            setTimeout(() => {
              setState((prev) => ({ ...prev, phase: 'done' }))
              onDone?.()
            }, 500)
          }, 50)
          return
        }

        setState({
          phase: 'exploding',
          packets: updatedPackets,
          progress: maxProgress,
        })
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [clear, onDone]
  )

  return { state, startExplosion, clear }
}
