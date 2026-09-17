import { View, Text } from '@tarojs/components'
import { useEffect, useRef } from 'react'
import { quadraticBezierPoint } from '../../utils/bezier'
import type { FlyingPacket } from '../../types/coupon'
import { isRN } from '../../utils/platform'
import './index.scss'

// react-native 的入口包含 Flow 语法，web 端 webpack 无法解析，
// 因此不能在顶层 import；通过编译期常量守卫 require，
// web 构建时该分支为死代码，webpack 不会打包 react-native。
type RNModule = typeof import('react-native')

let Animated: RNModule['Animated']
let Easing: RNModule['Easing']

if (process.env.TARO_ENV === 'rn') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const RN: RNModule = require('react-native')
  Animated = RN.Animated
  Easing = RN.Easing
}

interface RedPacketProps {
  packet: FlyingPacket
  progress: number
}

function RNRedPacket({ packet }: RedPacketProps) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    anim.setValue(0)
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [anim])

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [packet.start.x, packet.end.x],
  })
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [packet.start.y, packet.end.y],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: [{ translateX }, { translateY }, { scale: 0.85 }],
        opacity: 0.9,
      }}
    >
      <Text className='red-packet__icon'>🧧</Text>
    </Animated.View>
  )
}

export default function RedPacket({ packet, progress }: RedPacketProps) {
  if (isRN) {
    return <RNRedPacket packet={packet} progress={progress} />
  }

  const point = quadraticBezierPoint(
    progress,
    packet.start,
    packet.control,
    packet.end
  )
  const scale = 1 - progress * 0.3
  const opacity = 1 - progress * 0.2

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
