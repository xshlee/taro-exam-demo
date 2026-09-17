import { View, Text } from '@tarojs/components'
import Tag from '../Tag'
import { textWidth } from '../../utils/measure'
import { truncateAddress } from '../../utils/truncate'
import type { AddressItemData } from '../../types/address'
import './index.scss'

type AddressItemProps = AddressItemData

// 按 750rpx 设计稿计算出的可用文本宽度
const CONTENT_WIDTH = 490
const ADDRESS_FONT_SIZE = 28
const TAG_FONT_SIZE = 20
const TAG_PADDING_HORIZONTAL = 16
const TAG_MARGIN_LEFT = 8
const SPACE_WIDTH = 8
const ELLIPSIS = '…'

function tagWidth(text: string): number {
  return textWidth(text, TAG_FONT_SIZE) + TAG_PADDING_HORIZONTAL
}

function leadingWidth(tags: AddressItemData['tags']): number {
  if (tags.length === 0) return 0
  const tagsWidth = tags.reduce((sum, tag) => sum + tagWidth(tag.text), 0)
  return tagsWidth + tags.length * SPACE_WIDTH
}

function endTagWidth(text: string): number {
  return (
    textWidth(text, TAG_FONT_SIZE) +
    TAG_PADDING_HORIZONTAL +
    TAG_MARGIN_LEFT
  )
}

function EditIcon() {
  return <Text className='edit-icon'>✎</Text>
}

export default function AddressItem({
  name,
  phone,
  address,
  tags,
  endTag,
  selected = false,
}: AddressItemProps) {
  const lw = leadingWidth(tags)
  const etw = endTag ? endTagWidth(endTag) : 0

  const { displayAddress, showEndTag } = truncateAddress(address, endTag, {
    containerWidth: CONTENT_WIDTH,
    leadingWidth: lw,
    endTagWidth: etw,
    fontSize: ADDRESS_FONT_SIZE,
    endTagMaxRatio: 0.5,
    ellipsis: ELLIPSIS,
  })

  return (
    <View className={`address-item ${selected ? 'address-item--selected' : ''}`}>
      <View className={`radio ${selected ? 'radio--selected' : ''}`}>
        {selected && <View className='radio-inner' />}
      </View>

      <View className='address-item__content'>
        <View className='address-item__text-wrap'>
          <Text className='address-item__text' numberOfLines={2}>
            {tags.map((tag, index) => (
              <Text key={index}>
                <Tag text={tag.text} variant={tag.variant} />
                {index < tags.length - 1 ? ' ' : ''}
              </Text>
            ))}
            {tags.length > 0 && ' '}
            <Text className='address-item__body'>{displayAddress}</Text>
            {showEndTag && (
              <Text className='address-item__end-tag'>{endTag}</Text>
            )}
          </Text>
        </View>

        <View className='address-item__meta'>
          <Text className='address-item__name'>{name}</Text>
          <Text className='address-item__phone'>{phone}</Text>
        </View>
      </View>

      <View className='address-item__action'>
        <EditIcon />
      </View>
    </View>
  )
}
