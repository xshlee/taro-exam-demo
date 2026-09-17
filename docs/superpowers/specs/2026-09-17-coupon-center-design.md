# 优惠中心浮层动效设计文档

## 1. 背景与目标

在「题目二」页面增加「优惠中心」入口按钮，点击后从底部滑出优惠券浮层。浮层内展示优惠券列表，点击「每月领券」券包的领券按钮后：

- 暴涨 1~4 张新券。
- 每个新券对应一个红包，沿抛物线飞向该新券商品图的正中心。
- 落地后新券背景高亮闪一闪。
- 同时显示 Toast「成功领取 N 张券」，底部按钮从「一键领券」变为「领券中...」，动画结束后变为「再看一次」。

目标平台：微信小程序、H5、支付宝、抖音、React Native，要求各端表现尽可能一致。

## 2. 整体架构

### 2.1 新增文件

| 文件 | 职责 |
|---|---|
| `src/pages/question-two/index.tsx` | 「题目二」页面，提供「优惠中心」入口按钮 |
| `src/components/CouponCenter/index.tsx` | 优惠中心浮层容器（遮罩 + 底部弹窗 + tab 头 + 列表区 + 底部按钮） |
| `src/components/CouponCenter/index.scss` | 浮层样式 |
| `src/components/CouponTabs/index.tsx` | 顶部 tab 视觉组件（仅展示，不切换） |
| `src/components/CouponList/index.tsx` | 可滚动券列表容器 |
| `src/components/CouponCard/index.tsx` | 单张券卡片 |
| `src/components/RedPacket/index.tsx` | 飞行红包粒子（Web 用 inline transform，RN 用 Animated） |
| `src/components/CouponCenter/hooks/useCouponCenter.ts` | 浮层开关、券数据、领取状态、动画状态管理 |
| `src/components/CouponCenter/hooks/useAnimation.ts` | 统一动画调度（抛物线进度、高亮计时） |
| `src/components/CouponCenter/hooks/useMeasurements.ts` | 跨端测量按钮与券图坐标 |
| `src/types/coupon.ts` | 券相关类型定义 |
| `src/utils/bezier.ts` | 二次贝塞尔曲线计算 |
| `src/utils/platform.ts` | `isRN()` 等环境判断 |
| `src/assets/red-packet.png` | 飞行红包图标 |
| `src/assets/coupon-package.png` | 「专享券包」左侧装饰图 |
| `src/assets/placeholder-food.png` | 商品占位图 |

### 2.2 状态机

```
CLOSED
  ↓ 点击「优惠中心」按钮
OPENING  →  OPENED
  ↓ 点击「每月领券」领券按钮
CLAIMING
  ↓ 生成新券、计算落点
EXPLODING   (约 700ms)
  ↓ 红包到达券图中心
LANDED
  ↓ 触发高亮
FLASHING    (约 500ms)
  ↓
DONE  →  OPENED（可再次点击「再看一次」）
```

## 3. 数据模型

### 3.1 类型定义

```ts
export type CouponStatus = 'available' | 'claimed' | 'unavailable'

export interface CouponTag {
  text: string
  color?: string      // 标签文字色，默认 #ff4d4f
  bgColor?: string    // 标签背景色，默认 #fff2f0
}

export interface CouponItem {
  id: string
  title: string
  subtitle?: string            // 如「甄选白羽鸡翅尖」「2张券待领取」
  priceText: string            // 如「10元」「39.9元」「39.9元起」
  validity: string             // 如「2025.10.29-2026.11.29」
  image?: string               // 商品图 url，mock 用占位图
  tags?: CouponTag[]           // APP专享、新品尝鲜、白金会员享 等
  status: CouponStatus
  reason?: string              // 不可用原因 / 规则说明
  isPackage?: boolean          // 是否为「每月领券」券包
  packageCount?: number        // 券包内待领取张数
  isNew?: boolean              // 是否是本次暴涨产生的新券（用于高亮）
}

export interface FlyingPacket {
  id: string
  targetCouponId: string
  progress: number             // 0 ~ 1
  start: Point
  end: Point
  control: Point
}

export interface Point {
  x: number
  y: number
}
```

### 3.2 Mock 数据

初始列表：

```ts
const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'c1',
    title: '美味经典芝士风情皇家卷边披萨披萨披萨',
    priceText: '39.9元',
    validity: '2025.10.29-11.29',
    status: 'available',
  },
  {
    id: 'c2',
    title: '每月领券',
    subtitle: '2张券待领取',
    priceText: '',
    validity: '',
    isPackage: true,
    packageCount: 2,
    status: 'available',
  },
  {
    id: 'c3',
    title: '香辣劲爆鸡米花小份10块',
    subtitle: '甄选白羽鸡翅尖',
    priceText: '10元',
    validity: '2025.10.29-2026.11.29',
    tags: [
      { text: 'APP专享' },
      { text: '白金会员享', color: '#d4a574', bgColor: '#fff8f0' },
    ],
    status: 'available',
  },
]
```

### 3.3 新券生成规则

点击券包后生成 1~4 张新券：

```ts
function generateNewCoupons(seedId: string): CouponItem[] {
  const count = Math.floor(Math.random() * 4) + 1
  return Array.from({ length: count }, (_, i) => ({
    id: `${seedId}-new-${Date.now()}-${i}`,
    title: '招牌香辣鸡腿堡鸡腿鸡腿鸡腿鸡腿鸡腿鸡腿',
    subtitle: '新品尝鲜',
    priceText: '19.9元',
    validity: '2025.10.29-11.29',
    tags: [{ text: '新品尝鲜', color: '#ff4d4f', bgColor: '#fff2f0' }],
    status: 'claimed',
    reason: '规则说明：今日剩余3次；每周三可用',
    isNew: true,
  }))
}
```

> 开发阶段可通过配置开关固定 `count = 2`，方便稳定演示。

## 4. 浮层与列表布局

### 4.1 入口按钮

在 `src/pages/question-two/index.tsx` 中居中放置红色按钮：

```tsx
<View className='question-two-page'>
  <View className='coupon-entry' onClick={openCouponCenter}>
    优惠中心
  </View>
</View>
```

### 4.2 浮层结构

```tsx
<View className='coupon-center'>
  <View className='coupon-center__mask' onClick={close} />
  <View className='coupon-center__sheet'>
    <View className='coupon-center__header'>
      <Text className='coupon-center__title'>优惠中心</Text>
      <Text className='coupon-center__close' onClick={close}>×</Text>
    </View>
    <CouponTabs active='领券' />
    <CouponList />
    <View className='coupon-center__footer'>
      <Text>{footerText}</Text>
    </View>
  </View>
</View>
```

### 4.3 样式要点

- 遮罩：`position: fixed`（Web）/ `position: absolute` 全屏（RN）。
- 底部弹窗：高度约为屏幕 80%，顶部圆角 24rpx。
- 列表区：`flex: 1`，Web 用 `overflow-y: scroll`，RN 用 `ScrollView`。
- 所有 `padding`、`border-radius`、`border` 拆分为单边/单角写法。
- 单位为 `rpx`。

## 5. 券卡片

### 5.1 普通券

- 左侧商品图（固定宽高比 1:1，约 140rpx）。
- 右侧信息区：标签、标题、副标题、价格、有效期。
- 右下角按钮：
  - `available`：红色「领券」
  - `claimed`：灰色「立即使用」
  - `unavailable`：灰色「不可用」

### 5.2 券包

- 左侧「专享券包」装饰图，背景橙黄色。
- 标题「每月领券」、副标题「N张券待领取」。
- 右侧红色「领券」按钮。

### 5.3 已领状态

- 价格文字颜色变灰。
- 按钮变为「立即使用」。
- 右上角显示「已领取」圆形水印（CSS 绝对定位或背景图）。

## 6. 动画系统

### 6.1 动画状态管理

由 `useAnimation` 统一维护：

```ts
interface AnimationState {
  phase: 'idle' | 'exploding' | 'landed' | 'flashing' | 'done'
  packets: FlyingPacket[]
  progress: number        // 0 ~ 1，当前轮动画总进度
  highlightProgress: number  // 0 ~ 1，高亮渐变进度
}
```

### 6.2 抛物线计算

二次贝塞尔曲线：

```ts
export function quadraticBezierPoint(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point
): Point {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  }
}
```

控制点计算：

```ts
function getControlPoint(start: Point, end: Point): Point {
  const midX = (start.x + end.x) / 2
  const height = Math.abs(end.x - start.x) * 0.6 + 80
  return { x: midX, y: Math.min(start.y, end.y) - height }
}
```

### 6.3 红包运动参数

- 时长：700ms。
- 缓动：`cubic-bezier(0.25, 0.46, 0.45, 0.94)`（easeOutQuad）。
-  stagger：第 i 个红包延迟 `i * 80ms` 启动。
- 起点：被点击「领券」按钮中心（相对浮层 sheet 左上角）。
- 终点：新券商品图中心（相对浮层 sheet 左上角）。

### 6.4 坐标测量

Web：

```ts
Taro.createSelectorQuery()
  .select(`#claim-btn-${packageId}`)
  .boundingClientRect()
  .select(`#coupon-img-${couponId}`)
  .boundingClientRect()
  .select('#coupon-center-sheet')
  .boundingClientRect()
  .exec(([btn, img, sheet]) => {
    const start = {
      x: btn.left + btn.width / 2 - sheet.left,
      y: btn.top + btn.height / 2 - sheet.top,
    }
    const end = {
      x: img.left + img.width / 2 - sheet.left,
      y: img.top + img.height / 2 - sheet.top,
    }
  })
```

RN：

```ts
import { findNodeHandle } from 'react-native'

ref.current.measureLayout(
  findNodeHandle(sheetRef.current),
  (x, y, width, height) => { /* ... */ },
  () => { /* fallback */ }
)
```

> 红包层使用绝对定位覆盖在浮层之上，坐标直接采用相对 sheet 的像素值，避免 rpx 转换误差。

### 6.5 红包渲染

Web：

```tsx
<View
  style={{
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    opacity,
  }}
>
  <Image src={redPacketIcon} />
</View>
```

RN：

```tsx
import { Animated } from 'react-native'

<Animated.View
  style={{
    position: 'absolute',
    left: 0,
    top: 0,
    transform: [
      { translateX: animX },
      { translateY: animY },
      { scale: animScale },
    ],
    opacity: animOpacity,
  }}
>
  <Image src={redPacketIcon} />
</Animated.View>
```

### 6.6 高亮闪一闪

新券卡片落地后添加高亮类：

```scss
.coupon-card--highlight {
  background-color: #fff8e6;
  transition: background-color 0.5s ease-out;
}
```

RN 端使用 `Animated.Value` 插值背景色，从 `#fff8e6` 渐变到 `#ffffff`。

### 6.7 Toast 与底部按钮

- 点击领券后，底部按钮立即变为「领券中...」，并禁用点击。
- 全部红包落地后，显示 Toast「成功领取 N 张券」，持续 1500ms。
- Toast 消失后，底部按钮变为「再看一次」，点击可重新触发整套动画。

## 7. 跨端兼容

### 7.1 平台分支

```ts
export const isRN = process.env.TARO_ENV === 'rn'
```

### 7.2 动画引擎

- Web：用 `requestAnimationFrame` 或 `setInterval(16ms)` 统一更新 inline transform。
- RN：用 `Animated.timing` + `Easing.bezier`，参数与 Web 完全一致。

### 7.3 滚动容器

- Web：`<ScrollView scrollY>`。
- RN：`<ScrollView>` 配合 `flex: 1`。
- 新券若落在可视区域外，先 `scrollIntoView` 或 `scrollTo` 到可见区域，红包仍按全局坐标飞行。

### 7.4 样式约束

- 不使用 `display: inline/inline-block`、`white-space`、`text-overflow`。
- 所有 shorthand 属性拆成单边/单角。
- RN 不支持 `position: fixed` 和 `box-shadow`，用 `absolute` 和纯色边框替代。

### 7.5 图片资源

- 本地图片统一使用 `require('../../assets/xxx.png')`，兼容 RN。

## 8. 风险与兜底

| 风险 | 兜底方案 |
|---|---|
| 坐标测量失败或异步延迟 | 红包从按钮中心直接淡入淡出到目标券区域，不飞抛物线 |
| RN Animated 复杂轨迹不稳定 | 简化为线性移动 + 缩放 |
| 低端机掉帧 | 减少同时飞行的红包数量上限为 2，或降低帧率 |
| 新券插入后列表跳动 | 新券先以占位高度插入，测量完成后再启动动画 |

## 9. 验收标准

### 9.1 功能

- 「题目二」页面显示「优惠中心」按钮，点击滑出浮层。
- 浮层内展示券列表，点击「每月领券」按钮触发 1~4 个红包。
- 红包沿抛物线飞向对应新券商品图中心。
- 新券落地后背景高亮闪一闪。
- 显示 Toast，底部按钮状态正确变化。

### 9.2 编译

```bash
npx tsc --noEmit
npm run build:weapp
npm run build:h5
npm run build:rn
npm run build:alipay
npm run build:tt
```

以上命令均需通过。

## 10. 后续步骤

1. 用户审阅并批准本设计文档。
2. 使用 `writing-plans` 技能制定详细实现计划。
3. 按实现计划分步开发、自测、提交。
