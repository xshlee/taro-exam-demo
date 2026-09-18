import { charWidth, textWidth } from './measure'

export interface TruncateOptions {
  containerWidth: number
  leadingWidth: number
  fontSize: number
}

export interface TruncateResult {
  singleLine: boolean
  line1: string
  line2: string
  line2Display: string
  line2Ellipsis: boolean
  line2LetterSpacing: number
  showEndTag: boolean
}

export function truncateAddress(
  address: string,
  endTag: string | undefined,
  options: TruncateOptions
): TruncateResult {
  const { containerWidth, leadingWidth, fontSize } = options
  const hasEndTag = Boolean(endTag)
  const chars = Array.from(address)
  const prefixSum: number[] = []
  let sum = 0

  for (const char of chars) {
    sum += charWidth(char, fontSize)
    prefixSum.push(sum)
  }

  const widthBetween = (from: number, to: number): number => {
    if (from >= to) return 0
    const end = prefixSum[to - 1]
    const start = from > 0 ? prefixSum[from - 1] : 0
    return end - start
  }

  const fit = (from: number, maxWidth: number): number => {
    let lo = from
    let hi = chars.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2)
      if (widthBetween(from, mid) <= maxWidth) {
        lo = mid
      } else {
        hi = mid - 1
      }
    }
    return lo
  }

  const line1End = fit(0, Math.max(containerWidth - leadingWidth, 0))
  const line1 = chars.slice(0, line1End).join('')

  if (line1End >= chars.length) {
    return {
      singleLine: true,
      line1: address,
      line2: '',
      line2Display: '',
      line2Ellipsis: false,
      line2LetterSpacing: 0,
      showEndTag: hasEndTag,
    }
  }

  const remainingWidth = widthBetween(line1End, chars.length)
  const line2 = chars.slice(line1End).join('')

  if (hasEndTag) {
    return {
      singleLine: false,
      line1,
      line2,
      line2Display: line2,
      line2Ellipsis: false,
      line2LetterSpacing: 0,
      showEndTag: true,
    }
  }

  const line2Fits = remainingWidth <= containerWidth
  const ellipsis = '…'
  const ellipsisWidth = textWidth(ellipsis, fontSize)
  const line2End = line2Fits
    ? chars.length
    : fit(line1End, Math.max(containerWidth - ellipsisWidth, 0))
  const line2Prefix = chars.slice(line1End, line2End).join('')
  const line2Display = line2Fits ? line2 : line2Prefix + ellipsis
  const line2Ellipsis = !line2Fits
  const line1Right = leadingWidth + textWidth(line1, fontSize)
  const line2LetterSpacing = line2Ellipsis
    ? Math.max(
        (line1Right - textWidth(line2Display, fontSize)) /
          Math.max(Array.from(line2Display).length - 1, 1),
        0
      )
    : 0

  return {
    singleLine: false,
    line1,
    line2,
    line2Display,
    line2Ellipsis,
    line2LetterSpacing,
    showEndTag: false,
  }
}
