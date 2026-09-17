# AGENTS.md
# 项目：Taro3 + React + TypeScript 多端小程序项目
## 技术栈
- Taro 3
- React
- TypeScript
- pnpm 包管理器
- 目标端：微信小程序（优先），RN、H5、支付宝、抖音
- 样式：scss

## 允许修改范围
✅ src/**
✅ config/**
✅ package.json
✅ tsconfig.json
✅ .eslintrc.js / .prettierrc
✅ project.config.json
✅ app.config.ts / app.tsx
✅ .gitignore

## 禁止修改
❌ node_modules
❌ dist
❌ .git 目录
❌ AGENTS.md（除非我明确要求修改）
❌ 自动生成的打包产物目录

## 项目命令
- 安装依赖：pnpm install
- 微信小程序开发：pnpm dev:weapp
- H5开发：pnpm dev:h5
- 构建微信小程序：pnpm build:weapp
- 构建H5：pnpm build:h5
- 类型检查：pnpm tsc
- Eslint校验：pnpm lint

## 编码约束
1. 开启严格TS，尽量不使用any，优先interface/type定义类型
2. 使用React函数组件 + Hooks，禁止class组件
3. 组件放到 `src/components`，页面放在 `src/pages`
4. 使用scss编写样式，遵循Taro3规范
5. 页面路由统一在 `app.config.ts` 注册
6. 新增组件/页面，自动补充类型定义
7. 代码遵循Prettier格式化，保持风格统一
8. 不要引入不必要的第三方库

## 任务沟通规则
- 每次改动先输出diff预览，等待我确认后再应用
- 遇到不确定需求，先提问，不要自行猜测实现
- 任务完成后，列出改动文件清单 + 验证步骤
- 执行命令时，把完整输出返回给我

将提示词记录到根目目录 提示词.md中