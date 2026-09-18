# Taro Exam

Taro 3 + React + TypeScript 多端示例项目，主要面向微信小程序，同时支持 H5、支付宝、抖音和 React Native。

## 项目内容

- 题目一：地址列表、标签布局和跨端文本截断。
- 题目二：优惠中心浮层、优惠券列表、红包抛物线动画和新券高亮效果。
- 红包终点使用对应券图的实际中心；Web 端通过 `boundingClientRect` 测量，RN 端通过 `onLayout` 合成多层布局坐标。

## 环境要求

- Node.js：建议使用 Node 18 LTS。
- npm。
- 微信小程序开发需要微信开发者工具。
- RN 构建还需要 Android SDK、JDK 11+ 和匹配的 React Native/Metro 环境。

## 安装

```bash
npm install
```

## 开发

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

微信小程序编译产物位于 `dist/weapp`，使用微信开发者工具导入该目录进行预览。

## 构建

```bash
npm run build:weapp
npm run build:h5
npm run build:alipay
npm run build:tt
npm run build:rn
```

## 类型检查与测试

```bash
npx tsc --noEmit
npm test -- --runInBand
npm test -- --runInBand __tests__/coupon-layout.test.ts
```

`coupon-layout.test.ts` 覆盖嵌套布局坐标、滚动偏移变化和布局缺失时的保护逻辑。

## 跨端实现约束

- 样式优先使用 `rpx`、flex 布局和 Taro 支持的跨端属性。
- RN 不支持 Web CSS 的 `pointer-events` 样式声明；需要设置不可点击时，在 Taro 组件上使用 `pointerEvents='none'` 属性。
- RN 不支持把 Web CSS transform 字符串直接转换为样式对象。红包动画在 RN 使用 `Animated`，Web 使用贝塞尔曲线和 inline transform。
- 不在 RN 分支使用固定的券图坐标；所有动画落点必须来自实际布局测量。
- 新券列表发生滚动时，先等待券图中心连续两次测量稳定，再启动红包动画。

## 已知构建说明

- Taro 构建可能提示缺少用户级 `.taro-global-config/index.json`，不影响项目编译。
- H5 可能提示入口体积超过 Webpack 建议阈值，该提示不代表编译失败。
- RN 构建依赖 Node、Metro、React Native 和第三方原生包版本严格匹配；若 Metro 在 `react-native-gesture-handler` 源码处报现代 JavaScript 语法错误，应优先检查依赖版本和 Metro 转译配置。

## 目录结构

```text
src/
  components/       公共组件
  pages/            题目页面
  types/            TypeScript 类型
  utils/            跨端工具和几何计算
  app.config.ts     Taro 路由与应用配置
__tests__/          Jest 测试
config/             Taro 构建配置
```
