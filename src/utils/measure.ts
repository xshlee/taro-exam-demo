const CJK_WIDTH = 1.0
const ASCII_WIDTH = 0.55
const PUNCT_WIDTH = 0.45
const SPACE_WIDTH = 0.3

const ASCII_PUNCT_CODES = new Set([
  0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,
  0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x3a, 0x3b, 0x3c,
  0x3d, 0x3e, 0x3f, 0x40, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f,
  0x60, 0x7b, 0x7c, 0x7d, 0x7e,
])

function isPunctuation(code: number): boolean {
  return (
    ASCII_PUNCT_CODES.has(code) ||
    code === 0x2026 ||
    (code >= 0x3000 && code <= 0x303f)
  )
}

export function charWidth(char: string, fontSize: number): number {
  if (char === ' ') return fontSize * SPACE_WIDTH
  const code = char.charCodeAt(0)

  if (isPunctuation(code)) return fontSize * PUNCT_WIDTH

  if (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xff00 && code <= 0xffef)
  ) {
    return fontSize * CJK_WIDTH
  }

  if (code >= 0x21 && code <= 0x7e) {
    return fontSize * ASCII_WIDTH
  }

  return fontSize * CJK_WIDTH
}

export function textWidth(text: string, fontSize: number): number {
  let width = 0
  for (const char of text) {
    width += charWidth(char, fontSize)
  }
  return width
}
