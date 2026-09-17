import { charWidth, textWidth } from './measure'

export interface TruncateOptions {
  containerWidth: number
  leadingWidth: number
  endTagWidth: number
  fontSize: number
  maxLines?: number
  endTagMaxRatio?: number
  ellipsis?: string
}

export interface TruncateResult {
  displayAddress: string
  showEndTag: boolean
}

export function truncateAddress(
  address: string,
  endTag: string | undefined,
  options: TruncateOptions
): TruncateResult {
  const {
    containerWidth,
    leadingWidth,
    endTagWidth: rawEndTagWidth,
    fontSize,
    endTagMaxRatio = 0.5,
    ellipsis = '…',
  } = options

  const hasEndTag = Boolean(endTag)
  const maxEndTagWidth = containerWidth * endTagMaxRatio
  const effectiveEndTagWidth = hasEndTag
    ? Math.min(rawEndTagWidth, maxEndTagWidth)
    : 0

  const ellipsisWidth = textWidth(ellipsis, fontSize)
  const line1Available = Math.max(containerWidth - leadingWidth, 0)
  const line2Available = Math.max(containerWidth - effectiveEndTagWidth, 0)

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

  const line1End = fit(0, line1Available)
  const line2End = fit(line1End, line2Available)

  if (line2End >= chars.length) {
    return { displayAddress: address, showEndTag: hasEndTag }
  }

  const truncatedEnd = fit(
    line1End,
    Math.max(line2Available - ellipsisWidth, 0)
  )

  return {
    displayAddress: chars.slice(0, truncatedEnd).join('') + ellipsis,
    showEndTag: hasEndTag,
  }
}
