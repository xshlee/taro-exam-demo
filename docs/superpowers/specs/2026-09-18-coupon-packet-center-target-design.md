# 题目二红包落点居中设计

## 目标

点击「领券」后，每个分裂红包的抛物线终点必须是对应券图的实际几何中心，并在微信小程序、H5、支付宝、抖音和 RN 使用同一坐标语义。

## 设计

Web 端继续通过 `Taro.createSelectorQuery().boundingClientRect()` 测量浮层、领券按钮和新券图片；新券渲染并完成列表布局后，使用图片矩形的 `left + width / 2`、`top + height / 2`，换算为相对浮层的中心坐标。

RN 端不再使用固定的券图坐标估算。`CouponCard` 通过布局回调上报商品图的实际位置和尺寸，`CouponCenter` 汇总相对浮层的坐标后传给动画控制器。所有平台统一以红包自身中心跟随轨迹终点，Web 与 RN 均减去红包尺寸的一半。

若任一新券图片无法测量，则不启动不完整的红包动画，避免落点错误。保留现有贝塞尔曲线、错峰、缓动、落地消失和高亮闪烁行为。

## 组件边界

- `CouponCard`：暴露商品图布局回调，不负责计算动画坐标。
- `CouponList`：透传布局回调到每张券卡。
- `CouponCenter`：提供浮层布局上下文并收集券图测量结果。
- `useMeasurements`：统一 Web/RN 坐标转换和中心点计算。
- `useCouponCenter`：在测量完成后才创建红包目标。
- `RedPacket`：保持轨迹点为红包中心的渲染约定。

## 验证

- `npx tsc --noEmit`
- `npm run build:weapp`
- `npm run build:h5`
- `npm run build:alipay`
- `npm run build:tt`
- `npm run build:rn`
- 检查动画终点等于每张券图中心，测量失败时不产生错误动画。
