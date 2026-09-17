import { View, Text } from '@tarojs/components'
import { quadraticBezierPoint } from '../../utils/bezier'
import type { FlyingPacket } from '../../types/coupon'
import { isRN } from '../../utils/platform'
import './index.scss'

interface RedPacketProps {
  packet: FlyingPacket
  progress: number
}

export default function RedPacket({ packet, progress }: RedPacketProps) {
  const point = quadraticBezierPoint(progress, packet.start, packet.control, packet.end)
  const scale = 1 - progress * 0.3
  const opacity = 1 - progress * 0.2

  if (isRN) {
    // RN 分支：使用 Animated，在 Task 11 集成动画时替换
    return (
      <View
        className='red-packet'
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${point.x}px, ${point.y}px) scale(${scale})`,
          opacity,
        }}
      >
        <Text className='red-packet__icon'>🧧</Text>
      </View>
    )
  }

  return (
    <View
      className='red-packet'
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${point.x}px, ${point.y}px) scale(${scale})`,
        opacity,
      }}
    >
      <Text className='red-packet__icon'>🧧</Text>
    </View>
  )
}
