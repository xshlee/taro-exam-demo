# 题目二红包落点居中 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让多端红包抛物线的终点精确落在对应券图正中心。

**Architecture:** Web 端使用浮层内实际 DOM 矩形，RN 端使用 `onLayout` 实际布局数据；两端统一转换成相对浮层的中心坐标，动画层只消费中心点。

**Tech Stack:** Taro 3.6、React、TypeScript、SCSS、React Native Animated。

## Global Constraints

- 只使用现有依赖，不新增第三方包。
- 保持函数组件、Hooks、严格 TypeScript 和现有动画参数。
- 坐标相对 `#coupon-center-sheet`，终点表示红包中心。
- 兼容微信、H5、支付宝、抖音和 RN。
- 不修改 `node_modules`、`dist`、`.git` 或 `CLAUDE.md`。
- 保留工作区中与本任务无关的既有改动。

---

### Task 1: 定义跨端布局测量接口

**Files:**
- Modify: `src/types/coupon.ts`
- Modify: `src/components/CouponCard/index.tsx`

**Interfaces:**
- Consumes: 现有 `CouponItem` 和 Taro `View` 组件。
- Produces: 商品图布局回调类型，以及 `CouponCard` 的可选布局回调属性。

- [ ] **Step 1: 为券图布局定义严格类型**

在 `src/types/coupon.ts` 增加表示布局矩形的类型，至少包含 `x`、`y`、`width`、`height` 四个 number 字段；增加按券 ID 回传布局的回调类型。不要使用 `any`。

- [ ] **Step 2: 将布局回调挂到商品图节点**

在 `CouponCard` props 增加可选的布局回调，商品图 View 保留现有 `id`，并把 Taro/RN 支持的 `onLayout` 事件转换为严格类型后回调 `item.id` 与实际布局数据。Web 端继续依赖现有 selector 查询，不改变视觉样式和点击逻辑。

- [ ] **Step 3: 运行类型检查**

Run: `npx tsc --noEmit`

Expected: 命令成功退出，未出现新增 TypeScript 错误。

---

### Task 2: 透传并收集券图布局

**Files:**
- Modify: `src/components/CouponList/index.tsx`
- Modify: `src/components/CouponCenter/index.tsx`

**Interfaces:**
- Consumes: Task 1 导出的布局回调类型和 `CouponCard` 属性。
- Produces: `CouponList` 的布局回调透传，以及优惠浮层内按券 ID 保存的实际布局数据。

- [ ] **Step 1: 扩展 CouponList 属性**

增加 `onCouponImageLayout` 属性，并在 `coupons.map` 渲染 `CouponCard` 时原样传入。现有 `forwardRef`、滚动属性和 `onClaim` 行为保持不变。

- [ ] **Step 2: 在 CouponCenter 保存布局结果**

在 `CouponSheet` 中用 `useRef` 保存最新的券图布局映射，并通过 `CouponList` 回调更新。布局数据只按 `couponId` 索引，不修改券数据结构；浮层卸载时由组件生命周期自然清理。

- [ ] **Step 3: 提供浮层相对坐标上下文**

为 RN 增加浮层自身的布局回调或等价测量数据，使券图布局可以转换为相对浮层的坐标。Web 端保留 `id='coupon-center-sheet'`，不改变现有 selector 查询契约。

- [ ] **Step 4: 运行类型检查**

Run: `npx tsc --noEmit`

Expected: 命令成功退出。

---

### Task 3: 统一 Web/RN 中心坐标测量

**Files:**
- Modify: `src/components/CouponCenter/hooks/useMeasurements.ts`
- Modify: `src/components/CouponCenter/hooks/useCouponCenter.ts`

**Interfaces:**
- Consumes: Web selector 矩形、RN 实际布局矩形、`Point` 和现有 `MeasuredTarget`。
- Produces: 只有起点和全部新券中心点有效时才启动动画的领取流程。

- [ ] **Step 1: 保留并校验 Web 中心计算**

继续以券图矩形的 `left + width / 2` 和 `top + height / 2` 计算中心，并减去浮层左上角。计算前检查浮层、图片矩形和宽高有效；任一新券缺失时返回不完整结果并阻止动画。

- [ ] **Step 2: 消除 RN 固定终点估算**

将 RN 测量分支改为消费 CouponCenter 收集的实际布局数据，按 `x + width / 2`、`y + height / 2` 计算券图中心，再减去浮层布局坐标。删除 `rpx(90)` 和 `rpx(260 + index * 200 + 70)` 这类固定终点估算。

- [ ] **Step 3: 调整领取时序**

保留现有流程：先测量券包按钮起点，再插入新券，等待新券布局稳定后测量全部终点，最后调用 `startExplosion`。测量结果数量必须等于本轮新券数量，且起点有效；否则清理领取状态并不启动错误动画。

- [ ] **Step 4: 防止旧布局污染**

每轮领取开始前清理本轮新券的旧布局结果；组件卸载时保持现有计时器清理逻辑。重复领取不能复用上一轮同前缀券的坐标。

- [ ] **Step 5: 运行类型检查与相关测试**

Run: `npx tsc --noEmit`

Expected: 命令成功退出；若仓库已有测量或动画测试，运行对应 Jest 用例并保持全部通过。

---

### Task 4: 校准红包中心对齐并验证

**Files:**
- Modify: `src/components/RedPacket/index.tsx` only if the center contract requires code changes.
- Modify: `src/components/RedPacket/index.scss` only if the center offset requires style changes.

**Interfaces:**
- Consumes: Task 3 产生的以红包中心为语义的 `FlyingPacket.end`。
- Produces: Web 与 RN 视觉上以券图中心为最终落点的红包动画。

- [ ] **Step 1: 校验 Web 偏移**

确认 `.red-packet` 使用 `margin-left: -32rpx`、`margin-top: -32rpx`，使 64rpx 容器中心位于轨迹点；若当前实现已经满足则不改文件。

- [ ] **Step 2: 校验 RN 偏移**

确认 RN Animated 容器使用 32dp 尺寸与 `marginLeft: -16`、`marginTop: -16`，使红包中心跟随轨迹点；若当前实现已经满足则不改文件。

- [ ] **Step 3: 执行全端验证**

Run each command separately:

```bash
npx tsc --noEmit
npm run build:weapp
npm run build:h5
npm run build:alipay
npm run build:tt
npm run build:rn
```

Expected: 各命令成功退出；允许既有警告，但不得出现编译错误。

- [ ] **Step 4: 手工检查落点**

在题目二点击「每月领券」的「领券」按钮，确认每个红包最终中心与对应新券商品图中心重合；确认新券列表滚动后仍然重合；确认 RN 无固定坐标偏移、无红屏。

---

### Task 5: 更新项目提示词记录

**Files:**
- Modify: `提示词.md`

**Interfaces:**
- Consumes: 已确认的设计和最终验证结果。
- Produces: 根目录需求记录，包含多端落点规则和验收命令。

- [ ] **Step 1: 追加需求记录**

记录 Web 使用实际券图矩形中心、RN 使用实际布局回调、红包轨迹点表示红包中心，以及六项验证命令。

- [ ] **Step 2: 检查差异**

Run: `git diff --check && git status --short`

Expected: 无 whitespace error；仅出现本任务新增或修改的文件及开始时已存在的工作区改动，不创建提交。
