import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
// Jest's Taro/Babel JSX transform still reads the React runtime binding.
void React
import { View, Text } from '@tarojs/components'
import Tag from '../Tag'
import { textWidth } from '../../utils/measure'
import { truncateAddress } from '../../utils/truncate'
import { isRN } from '../../utils/platform'
import type { AddressItemData } from '../../types/address'
import './index.scss'

type AddressItemProps = AddressItemData & { onSelect?: () => void }

const FALLBACK_CONTENT_WIDTH = 598
const DESIGN_WIDTH = 750
const ADDRESS_FONT_SIZE = 28
const TAG_FONT_SIZE = 20
const TAG_PADDING_HORIZONTAL = 16
const TAG_BORDER_WIDTH = 2
const SPACE_WIDTH = 8.4
const MEASUREMENT_EPSILON = 0.5

function getAddressContentToken(id: string): string {
  let token = 'a'
  for (let index = 0; index < id.length; index += 1) {
    token += id.charCodeAt(index).toString(16).padStart(4, '0')
  }
  return token
}

function measureContentWidth(id: string): Promise<number | null> {
  if (isRN) return Promise.resolve(null)

  return new Promise((resolve) => {
    try {
      const query = Taro.createSelectorQuery()
      query
        .select(`#address-item-content-${getAddressContentToken(id)}`)
        .boundingClientRect()
      query.exec((rects: unknown) => {
        try {
          const rect = Array.isArray(rects)
            ? (rects[0] as
                | Taro.NodesRef.BoundingClientRectCallbackResult
                | null
                | undefined)
            : null
          const windowWidth = Taro.getSystemInfoSync().windowWidth
          if (
            !rect ||
            !Number.isFinite(rect.width) ||
            rect.width <= 0 ||
            !Number.isFinite(windowWidth) ||
            windowWidth <= 0
          ) {
            resolve(null)
            return
          }
          resolve((rect.width * DESIGN_WIDTH) / windowWidth)
        } catch {
          resolve(null)
        }
      })
    } catch {
      resolve(null)
    }
  })
}

function tagWidth(tag: AddressItemData['tags'][number]): number {
  const border = tag.variant === 'outline' ? TAG_BORDER_WIDTH : 0
  return textWidth(tag.text, TAG_FONT_SIZE) + TAG_PADDING_HORIZONTAL + border
}

function leadingWidth(tags: AddressItemData['tags']): number {
  if (tags.length === 0) return 0
  const tagsWidth = tags.reduce((sum, tag) => sum + tagWidth(tag), 0)
  return tagsWidth + tags.length * SPACE_WIDTH
}

function EditIcon() {
  return <Text className='edit-icon'>✎</Text>
}

function getLetterSpacingStyle(value: number) {
  if (!isRN) {
    return { letterSpacing: `${value}rpx` }
  }

  try {
    const windowWidth = Taro.getSystemInfoSync().windowWidth
    if (Number.isFinite(windowWidth) && windowWidth > 0) {
      return { letterSpacing: (value * windowWidth) / DESIGN_WIDTH }
    }
  } catch {
    // Use the design-unit value as a safe RN fallback when system info is unavailable.
  }

  return { letterSpacing: value }
}

export default function AddressItem({
  id,
  name,
  phone,
  address,
  tags,
  endTag,
  selected = false,
  onSelect,
}: AddressItemProps) {
  const contentToken = getAddressContentToken(id)
  const [contentWidth, setContentWidth] = useState(FALLBACK_CONTENT_WIDTH)

  useEffect(() => {
    let mounted = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const measure = () => {
      if (!mounted) return

      void measureContentWidth(id).then((measuredWidth) => {
        if (!mounted || measuredWidth === null) {
          return
        }
        setContentWidth((currentWidth) =>
          Math.abs(currentWidth - measuredWidth) > MEASUREMENT_EPSILON
            ? measuredWidth
            : currentWidth
        )
      })
    }

    if (isRN) {
      return () => {
        mounted = false
      }
    }

    if (typeof Taro.nextTick === 'function') {
      try {
        Taro.nextTick(measure)
      } catch {
        timer = setTimeout(measure, 0)
      }
    } else {
      timer = setTimeout(measure, 0)
    }

    return () => {
      mounted = false
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [id])

  const { singleLine, line1, line2Display, line2LetterSpacing, showEndTag } =
    truncateAddress(address, endTag, {
      containerWidth: contentWidth,
      leadingWidth: leadingWidth(tags),
      fontSize: ADDRESS_FONT_SIZE,
    })

  const line2Style = getLetterSpacingStyle(line2LetterSpacing)
  const leadingTags = (
    <>
      {tags.map((tag, index) => (
        <Text key={index}>
          <Tag text={tag.text} variant={tag.variant} />
          {index < tags.length - 1 ? ' ' : ''}
        </Text>
      ))}
      {tags.length > 0 && ' '}
    </>
  )

  return (
    <View
      className={`address-item ${selected ? 'address-item--selected' : ''}`}
      onClick={onSelect}
    >
      <View className={`radio ${selected ? 'radio--selected' : ''}`}>
        {selected && <View className='radio-inner' />}
      </View>

      <View
        id={`address-item-content-${contentToken}`}
        className='address-item__content'
      >
        <View className='address-item__text-wrap'>
          {/* 第一行: 前置tag + 地址, 按估算断行点显式切分 */}
          <View className='address-item__line'>
            <View className='address-item__ellipsis'>
              <Text className='address-item__text' numberOfLines={1}>
                {leadingTags}
                <Text className='address-item__body'>{line1}</Text>
              </Text>
            </View>
            {singleLine && showEndTag && (
              <Text className='address-item__end-tag' numberOfLines={1}>
                {endTag}
              </Text>
            )}
          </View>

          {/* 第二行: 无尾标签手动省略并对齐, 尾标签场景使用原生单行省略 */}
          {!singleLine &&
            (showEndTag ? (
              <View className='address-item__line'>
                <View className='address-item__ellipsis'>
                  <Text className='address-item__text' numberOfLines={1}>
                    <Text className='address-item__body'>{line2Display}</Text>
                  </Text>
                </View>
                <Text className='address-item__end-tag' numberOfLines={1}>
                  {endTag}
                </Text>
              </View>
            ) : (
              <View className='address-item__line'>
                <View className='address-item__ellipsis address-item__ellipsis--manual'>
                  <Text
                    className='address-item__text'
                    numberOfLines={1}
                    {...(isRN ? { ellipsizeMode: 'clip' as const } : {})}
                    style={line2Style}
                  >
                    <Text className='address-item__body'>{line2Display}</Text>
                  </Text>
                </View>
              </View>
            ))}
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
