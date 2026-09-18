# Outline 标签浅橙样式设计

## 目标

将项目中所有 `variant: 'outline'` 的标签统一调整为截图中的浅橙色视觉风格，保持现有尺寸、布局和组件 API 不变。

## 现状

`src/components/Tag/index.scss` 中 `.tag--outline` 当前使用红色文字、白色背景和浅红色边框。`Tag` 组件通过 `variant` 控制样式，多个页面和公共组件共用该样式。

## 设计

只修改 `.tag--outline` 的颜色属性：

- 文字：`#ff9a5c`
- 背景：`#fff7ef`
- 边框：`#ffc48f`

保留现有的字号、行高、内边距、圆角、边框宽度和边框类型。所有 outline 标签统一生效，不新增 `TagVariant` 类型，不修改调用方数据，不增加依赖。

## 组件边界

- `src/components/Tag/index.tsx`：不修改，继续使用现有 `variant: 'outline'`。
- `src/components/Tag/index.scss`：只调整 `.tag--outline` 的颜色。
- 其他页面和组件：不修改。

## 验证

- 检查差异仅包含 `src/components/Tag/index.scss` 的 outline 颜色变化。
- 运行 `npx tsc --noEmit`。
- 运行 `npm run build:weapp`。
- 运行 `npm run build:h5`。
- 确认现有 outline 标签的尺寸、间距和布局规则未改变。

## 非目标

不新增橙色 variant；不改变 solid 标签；不改变标签宽度计算或地址截断逻辑；不改变其他组件颜色。
