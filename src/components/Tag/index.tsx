import { Text } from '@tarojs/components'
import type { TagVariant } from '../../types/address'
import './index.scss'

interface TagProps {
  text: string
  variant?: TagVariant
}

export default function Tag({ text, variant = 'outline' }: TagProps) {
  return <Text className={`tag tag--${variant}`}>{text}</Text>
}
