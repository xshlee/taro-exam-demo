# Outline 标签浅橙样式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将所有 `variant: 'outline'` 标签统一调整为截图中的浅橙色文字、边框和背景，同时保持标签尺寸、布局和组件接口不变。

**Architecture:** 复用现有 `Tag` 组件及 `.tag--outline` 样式选择器，只替换三个颜色值。无需新增 variant、状态或组件逻辑；通过类型检查和微信/H5 构建验证样式编译与现有组件调用不受影响。

**Tech Stack:** Taro 3.6、React、TypeScript、SCSS、npm。

## Global Constraints

- 只修改 `src/**`、允许的配置文件和根目录 `提示词.md`；本任务只修改 `src/components/Tag/index.scss`。
- 保持 Taro3 多端支持：微信小程序为主，同时兼容 H5、RN、支付宝和抖音。
- 布局使用 rpx、flex 和跨端 CSS；不使用小程序私有选择器或 RN 不支持的 CSS 属性。
- 不修改 `Tag` 组件 API、`TagVariant` 类型、调用方数据、solid 标签或地址截断逻辑。
- 不新增第三方依赖，不修改 `node_modules`、`dist`、`.git`、`CLAUDE.md` 或 `AGENTS.md`。
- 用户未授权提交，因此不创建 commit。

## 文件职责

- `src/components/Tag/index.scss`：维护 `.tag--outline` 的视觉颜色；保留现有尺寸、圆角、内边距和边框结构。
- `src/components/Tag/index.tsx`：只读验证，不修改。

---

### Task 1: 更新 outline 标签颜色

**Files:**
- Modify: `src/components/Tag/index.scss:19-34`

**Interfaces:**
- Consumes: 现有 `.tag--outline` 类名及 `Tag` 组件的 `variant='outline'` 输出。
- Produces: 所有 outline 标签统一使用 `color: #ff9a5c`、`background-color: #fff7ef`、边框颜色 `#ffc48f`；字号、行高、内边距、圆角、边框宽度和边框样式保持原样。

- [ ] **Step 1: 检查现有样式基线**

确认 `src/components/Tag/index.scss` 当前 `.tag--outline` 仅包含颜色、背景和边框声明，且尺寸声明仍由 `.tag` 统一提供。不要修改 `.tag`、`.tag--solid` 或其他选择器。

- [ ] **Step 2: 修改三个颜色值**

将 `.tag--outline` 调整为：

```scss
.tag--outline {
  color: #ff9a5c;
  background-color: #fff7ef;
  border-top-width: 1rpx;
  border-right-width: 1rpx;
  border-bottom-width: 1rpx;
  border-left-width: 1rpx;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: solid;
  border-top-color: #ffc48f;
  border-right-color: #ffc48f;
  border-bottom-color: #ffc48f;
  border-left-color: #ffc48f;
}
```

保留现有顺序和所有非颜色属性，不新增页面级覆盖。

- [ ] **Step 3: 检查差异范围**

Run: `git diff -- src/components/Tag/index.scss`

Expected: 只出现 `.tag--outline` 的文字色、背景色和四个边框色变化；不应出现 `.tag`、`.tag--solid` 或其他文件差异。

- [ ] **Step 4: 运行类型检查**

Run: `npx tsc --noEmit`

Expected: exit code 0，且没有 TypeScript 错误。样式颜色变化不应影响类型系统。

- [ ] **Step 5: 构建微信和 H5 产物**

Run separately:

```bash
npm run build:weapp
npm run build:h5
```

Expected: 两个命令均 exit code 0；允许已有的全局 Taro 配置、入口体积和 Webpack deprecation warnings，但不得出现编译错误。

- [ ] **Step 6: 完成检查并记录未提交状态**

Run: `git diff --check && git status --short`

Expected: 无 whitespace error；现有工作区改动保持不变，本任务只新增 `src/components/Tag/index.scss` 的差异；不创建 commit。

