# 题目一地址截断实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复题目一地址在中英文/数字混排时第一行误显示省略号的问题，并让无尾标签时第二行省略号与第一行文字右缘对齐，同时保留停止接单标签右对齐及省略号贴标签的效果。

**Architecture:** `AddressItem` 在首帧使用 `598rpx` 兜底，挂载后通过 Taro 选择器测量 `.address-item__content` 的真实宽度并换算为 rpx。`truncateAddress` 保持纯函数，依据实际宽度计算第一行断点、第二行文本和字距补偿；组件按是否有尾标签选择原生省略或手动省略号渲染。

**Tech Stack:** Taro 3.6、React Hooks、TypeScript、SCSS、Jest。

## Global Constraints

- 只修改 `src/**`、允许的配置文件和根目录 `提示词.md`；本计划文件因已获用户授权而新增。
- 保持 Taro3 多端支持：微信小程序为主，同时兼容 H5、RN、支付宝和抖音。
- 布局使用 rpx、flex 和跨端 CSS；不使用小程序私有选择器或 RN 不支持的 CSS 属性。
- 使用函数组件和 React Hooks；严格类型，避免新增 `any` 和第三方依赖。
- 修改前展示 diff 并等待确认；不覆盖工作区已有的未提交改动。
- 不修改 `node_modules`、`dist`、`.git`、`CLAUDE.md` 或 `AGENTS.md`。

## 文件职责

- `src/utils/measure.ts`：只提供字符宽度和字符串宽度估算，不访问平台 API。
- `src/utils/truncate.ts`：只执行地址分行、尾标签占位和手动省略号/字距补偿计算。
- `src/components/AddressItem/index.tsx`：测量内容宽度、管理测量状态并渲染地址布局。
- `src/components/AddressItem/index.scss`：为两行 flex 文本和动态字距提供跨端布局。
- `提示词.md`：记录已确认的设计和验证命令；本轮不再修改其既有记录。

---

### Task 1: 扩展字符测量模型与地址纯函数

**Files:**
- Modify: `src/utils/measure.ts`
- Modify: `src/utils/truncate.ts`
- Create: `src/utils/truncate.test.ts`

**Interfaces:**
- Consumes: 现有 `charWidth(char, fontSize)`、`textWidth(text, fontSize)` 以及 `truncateAddress(address, endTag, options)`。
- Produces: `TruncateResult` 的 `singleLine`、`line1`、`line2`、`line2Display`、
  `line2Ellipsis`、`line2LetterSpacing` 和 `showEndTag`；组件任务依赖这些字段。

- [ ] **Step 1: 编写会失败的纯函数测试**

在 `src/utils/truncate.test.ts` 覆盖以下行为，测试只调用纯函数：

```ts
import { truncateAddress } from './truncate'

describe('truncateAddress', () => {
  const options = {
    containerWidth: 598,
    leadingWidth: 0,
    fontSize: 28,
  }

  test('短地址保持单行且不需要手动省略号', () => {
    expect(truncateAddress('城开YOYO联合办公 6楼', undefined, options)).toEqual({
      singleLine: true,
      line1: '城开YOYO联合办公 6楼',
      line2: '',
      line2Display: '',
      line2Ellipsis: false,
      line2LetterSpacing: 0,
      showEndTag: false,
    })
  })

  test('恰好填满两行时不增加省略号', () => {
    const address = '一'.repeat(42)
    const result = truncateAddress(address, undefined, options)
    expect(result.singleLine).toBe(false)
    expect(result.line1.length + result.line2.length).toBe(address.length)
    expect(result.line2Ellipsis).toBe(false)
    expect(result.line2Display).toBe(result.line2)
  })

  test('超过两行时只在第二行追加一个省略号', () => {
    const result = truncateAddress('一'.repeat(100), undefined, options)
    expect(result.singleLine).toBe(false)
    expect(result.line2Ellipsis).toBe(true)
    expect(result.line2Display.endsWith('…')).toBe(true)
    expect(result.line2Display.endsWith('……')).toBe(false)
  })

  test('尾标签存在时保留尾标签并限制到容器一半', () => {
    const result = truncateAddress('一'.repeat(100), '04:59 后餐厅停止接单', options)
    expect(result.showEndTag).toBe(true)
    expect(result.line2Ellipsis).toBe(false)
  })
})
```

测试固定上述返回字段，组件直接使用 `line2Display`，不保留未定义或兼容性分支字段。

- [ ] **Step 2: 运行纯函数测试确认当前实现失败**

Run: `npx jest src/utils/truncate.test.ts --runInBand`

Expected: FAIL，因为当前 `TruncateResult` 没有 `line2Ellipsis`、`line2LetterSpacing` 和 `line2Display`，字符模型仍使用旧的 ASCII 与空格宽度。

- [ ] **Step 3: 更新字符宽度模型**

在 `src/utils/measure.ts` 将模型调整为：

```ts
const CJK_WIDTH = 1.0
const LETTER_WIDTH = 0.68
const DIGIT_WIDTH = 0.58
const ASCII_WIDTH = 0.55
const PUNCT_WIDTH = 0.45
const SPACE_WIDTH = 0.3
```

在 `charWidth` 中先处理 `…` 的全宽，再处理空格、中文/全角、数字、字母、
其他 ASCII 标点和剩余字符，避免 `…` 先命中普通标点分支。普通空格在布局常量中使用 `8.4rpx`，而 `charWidth(' ', 28)` 继续等于 `28 * 0.3`，两者分别对应文本估算和标签间视觉间距。

- [ ] **Step 4: 实现纯函数输出和边界计算**

将 `TruncateOptions` 定义为：

```ts
export interface TruncateOptions {
  containerWidth: number
  leadingWidth: number
  fontSize: number
}
```

将 `TruncateResult` 定义为：

```ts
export interface TruncateResult {
  singleLine: boolean
  line1: string
  line2: string
  line2Display: string
  line2Ellipsis: boolean
  line2LetterSpacing: number
  showEndTag: boolean
}
```

实现步骤：

1. 用前缀和及二分 `fit` 计算从任意字符索引开始能放入的最大字符数。
2. 用 `containerWidth - leadingWidth` 计算首行地址容量；不再固定使用 `490rpx`，也不额外扣除会导致首行提前省略的 `14rpx` 安全余量。
3. 如果第一行容纳全部地址，返回单行结果；组件负责在存在尾标签且标签挤压文本时使用原生单行省略。
4. 如果地址超过第一行，令 `line1End` 为首行断点，第二行可用宽度为 `containerWidth`；当地址剩余宽度不超过该宽度时，第二行完整展示，不加省略号。
5. 当剩余地址超过第二行时，取 `line2` 的最大前缀，使 `textWidth(prefix) + textWidth('…') <= containerWidth`，设置 `line2Display = prefix + '…'`、`line2Ellipsis = true`。
6. 无尾标签时把第一行实际文字右缘作为第二行目标右缘：`line1Right = leadingWidth + textWidth(line1, fontSize)`。以第二行显示字符串的自然宽度为基准，计算 `line2LetterSpacing = (line1Right - textWidth(line2Display, fontSize)) / max(line2Display.length - 1, 1)`；只有第二行存在省略号且补偿结果为正时才使用该字距，否则固定为 `0`，避免字距压缩导致跨端差异。`line2LetterSpacing` 单位为 rpx；组件在 H5/小程序传 `${value}rpx`，RN 按实际 `windowWidth / 750` 换算为数值 dp。尾标签场景的 `line2LetterSpacing` 固定为 0，交由 flex 和原生省略号完成对齐。
7. 尾标签不参与纯函数的宽度参数；实际 JSX 由 flex 子项限制标签宽度为当前内容区的 50%。

- [ ] **Step 5: 运行纯函数测试确认通过**

Run: `npx jest src/utils/truncate.test.ts --runInBand`

Expected: PASS，所有边界断言通过。

- [ ] **Step 6: 提交纯计算变更**

```bash
git add src/utils/measure.ts src/utils/truncate.ts src/utils/truncate.test.ts
git commit -m "fix(address): align measured text truncation"
```

---

### Task 2: 在 AddressItem 中测量真实内容宽度

**Files:**
- Modify: `src/components/AddressItem/index.tsx`

**Interfaces:**
- Consumes: Task 1 的 `TruncateResult`，以及现有 `AddressItemData`、`isRN` 和 Taro `createSelectorQuery`。
- Produces: `contentWidth` 状态，初始值 `598`，成功测量后以 rpx 更新；组件继续暴露现有可选 `onSelect`。

- [ ] **Step 1: 编写测量逻辑所需的组件行为检查**

在现有测试环境不具备真实 Taro 节点布局，因此先在组件代码中保留可观察的选择器 `id`，并在手工验收中验证；不要为了模拟布局引入第三方依赖或修改 Jest 全局配置。检查点如下：

```tsx
<View id='address-item-content' className='address-item__content'>
```

同一页面会渲染多个地址项，因此实际实现必须把 `id` 做成基于地址项 `id` 的唯一值，例如 `address-item-content-${id}`，查询必须使用同一值。

- [ ] **Step 2: 实现首帧兜底和一次性测量**

在 `index.tsx` 中：

```ts
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { isRN } from '../../utils/platform'

const FALLBACK_CONTENT_WIDTH = 598
const DESIGN_WIDTH = 750

function measureContentWidth(id: string): Promise<number | null> {
  if (isRN) return Promise.resolve(null)

  return new Promise((resolve) => {
    try {
      const query = Taro.createSelectorQuery()
      query.select(`#address-item-content-${id}`).boundingClientRect()
      query.exec((rects) => {
        const rect = rects[0] as
          | Taro.NodesRef.BoundingClientRectCallbackResult
          | null
        const windowWidth = Taro.getSystemInfoSync().windowWidth
        if (!rect || rect.width <= 0 || windowWidth <= 0) {
          resolve(null)
          return
        }
        resolve((rect.width * DESIGN_WIDTH) / windowWidth)
      })
    } catch {
      resolve(null)
    }
  })
}
```

Use `useEffect` with `[id]`, schedule the query after the first layout using `Taro.nextTick` (or a zero-delay timer if the target does not support `nextTick`), and use a `mounted` boolean. On a valid result, update state only when the difference from the current width is meaningful; on failure keep `598`. Do not query from render or run an unbounded measurement loop.

- [ ] **Step 3: Pass measured width to truncateAddress**

Replace the fixed `CONTENT_WIDTH` use with:

```ts
const [contentWidth, setContentWidth] = useState(FALLBACK_CONTENT_WIDTH)

const truncateResult = truncateAddress(address, endTag, {
  containerWidth: contentWidth,
  leadingWidth: leadingWidth(tags),
  fontSize: ADDRESS_FONT_SIZE,
})
```

Keep `leadingWidth` and tag width calculations in rpx. Add outline border widths to the leading tag measurement and use `SPACE_WIDTH = 8.4` for the visual inter-tag gap. Ensure every address item has a unique selector id derived from its existing `id` field. Set `.address-item__end-tag` to `max-width: 50%` rather than a fixed `295rpx`, so the cap follows the measured content width.

- [ ] **Step 4: Run type checking**

Run: `npx tsc --noEmit`

Expected: PASS. If Taro callback types expose a nullable array differently, narrow the callback value with an explicit `Array.isArray`/null check rather than introducing `any`.

- [ ] **Step 5: Commit runtime measurement**

```bash
git add src/components/AddressItem/index.tsx
git commit -m "fix(address): measure content width after layout"
```

---

### Task 3: Render manually aligned and tail-tag address rows

**Files:**
- Modify: `src/components/AddressItem/index.tsx`
- Modify: `src/components/AddressItem/index.scss`

**Interfaces:**
- Consumes: Task 1 `line1`, `line2`, `line2Display`, `line2Ellipsis`, `line2LetterSpacing`, `singleLine`, `showEndTag`; Task 2 measured `contentWidth`.
- Produces: cross-platform address display with no first-line fallback ellipsis, right-aligned end tag, and second-line right-edge alignment.

- [ ] **Step 1: Write the failing component/render assertions**

Add a focused test or use the existing component test harness to assert the semantic output for the long no-tail-tag item and the long tail-tag item:

```tsx
expect(html).not.toContain('line1…')
expect(html).toContain('style="letter-spacing')
expect(html).toContain('04:59 后餐厅停止接单')
```

If the Taro test renderer cannot reliably serialize inline styles, keep the pure-function assertions from Task 1 as the automated contract and record the two JSX checks as manual checks in the task output; do not weaken the implementation to satisfy a serializer artifact.

- [ ] **Step 2: Render the first line without an added ellipsis**

For every multi-line result, render the first row as a flex row containing the leading tags and `line1` only. The first-row text wrapper must have `numberOfLines={1}` for RN and CSS single-line overflow for H5/小程序. Do not append `…` to `line1`.

- [ ] **Step 3: Render no-tail-tag second line with manual ellipsis and letter spacing**

For `!showEndTag && !singleLine`, render:

```tsx
<View className='address-item__line'>
  <View className='address-item__ellipsis address-item__ellipsis--manual'>
    <Text
      className='address-item__text'
      numberOfLines={1}
      style={{ letterSpacing: line2LetterSpacing }}
    >
      <Text className='address-item__body'>{line2Display}</Text>
    </Text>
  </View>
</View>
```

Use `line2Display` directly so the second-line ellipsis exists only when `line2Ellipsis` is true. Set `text-overflow: clip` on this manual branch; do not use native `text-overflow: ellipsis`, otherwise the platform may append a second ellipsis. Pass `letterSpacing` as `${line2LetterSpacing}rpx` on H5/小程序 and as a numeric dp value on RN.

- [ ] **Step 4: Render tail-tag rows with a flex-pinned tag**

For `showEndTag`, render each applicable row as:

```tsx
<View className='address-item__line'>
  <View className='address-item__ellipsis'>
    <Text className='address-item__text' numberOfLines={1}>
      ...
    </Text>
  </View>
  <Text className='address-item__end-tag' numberOfLines={1}>
    {endTag}
  </Text>
</View>
```

The tag must be `flex-shrink: 0`, have `margin-left: 8rpx`, `max-width: 50%` of the content row, and use `overflow: hidden`, `white-space: nowrap`, `text-overflow: ellipsis` plus RN `numberOfLines={1}`. The text wrapper must have `flex: 1`, `min-width: 0`, `overflow: hidden`, and native single-line ellipsis. This makes the tag right-aligned and places the ellipsis immediately before it.

- [ ] **Step 5: Update SCSS for the manual branch without RN-only or web-only layout dependencies**

Keep the existing flex row rules and add only a manual modifier that prevents native ellipsis from being applied twice:

```scss
.address-item__ellipsis--manual {
  overflow: hidden;
}

.address-item__ellipsis--manual .address-item__text {
  white-space: nowrap;
}
```

Do not use `position: absolute`, `-webkit-box`, or platform-private selectors in this address component. Keep `.address-item__action` fixed at `width: 32rpx` and `flex-shrink: 0`, and set `.address-item__end-tag` to `max-width: 50%`; when runtime width differs, the flex row's available width remains authoritative.

- [ ] **Step 6: Run type checking and focused tests**

Run: `npx tsc --noEmit && npx jest src/utils/truncate.test.ts --runInBand`

Expected: PASS with no TypeScript errors and all truncation tests passing.

- [ ] **Step 7: Commit address rendering**

```bash
git add src/components/AddressItem/index.tsx src/components/AddressItem/index.scss
git commit -m "fix(address): align two-line address rendering"
```

---

### Task 4: Validate builds and manual acceptance

**Files:**
- No source changes expected; if a validation-only correction is required, modify only the files listed in Tasks 1–3 after showing a new diff.

**Interfaces:**
- Consumes: completed address measurement, pure truncation, and rendering implementation.
- Produces: verified build artifacts in the existing build output locations; do not commit generated `dist` output.

- [ ] **Step 1: Check the complete diff before validation**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; confirm pre-existing unrelated modifications remain untouched.

- [ ] **Step 2: Run the complete automated validation**

Run each command separately and preserve the complete output:

```bash
npx tsc --noEmit
npm run build:weapp
npm run build:h5
npm test -- --runInBand
```

Expected: each command exits with status 0. If a command fails, fix the reported source issue and rerun that command; do not claim completion while any required command remains failing.

- [ ] **Step 3: Perform manual question-one acceptance**

Run: `npm run dev:h5`

Inspect the question-one page at the available browser viewport and verify:

1. The short item remains one line and does not display an ellipsis.
2. The third item with `04:59 后餐厅停止接单` pins the tag to the content area's right edge; any text ellipsis touches the tag's left edge.
3. The fourth and sixth long no-tail-tag items use at most two lines; the first line has no extra ellipsis; only an overflowing second line shows `…`.
4. The second-line manual ellipsis right edge aligns with the first line's last visible character/right edge.
5. Clicking any address row changes the selected radio/background and keeps the initial selection on item 5.
6. Resize/reload the page and verify the measured-width update does not cause a persistent layout loop or duplicate ellipsis.

- [ ] **Step 4: Report the final file list and evidence**

List modified/created source files and report the exact exit status/output summary for each command. Explicitly state any skipped platform build or manual check instead of implying it passed.

- [ ] **Step 5: Commit only source changes if requested**

Do not commit unless the user explicitly requests it. If requested, stage only the approved source/test files and use a message ending with the repository-required attribution line if one is supplied by the session instructions.
