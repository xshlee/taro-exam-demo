# CLAUDE.md
# Taro3 + React + TS 多端小程序项目规范
## 技术栈
- Taro3, React, TypeScript
- npm 包管理器
- 目标平台：微信小程序(主)、RN、H5、支付宝、抖音
- 样式：scss

## 允许修改
src/**, config/**, package.json, tsconfig.json, .eslintrc.js, .prettierrc, app.config.ts, project.config.json, .gitignore

## 禁止修改
node_modules, dist, .git目录, CLAUDE.md（除非我明确要求）

## 脚本命令
npm install          # 安装依赖
npm run dev:weapp    # 微信小程序开发
npm run build:weapp  # 微信打包
npm run dev:h5       # H5开发
npm run build:h5     # H5打包
npx tsc --noEmit     # TS类型校验
npm run lint         # Eslint检查

## 编码规则
1. TS严格模式，尽量不用any，优先type/interface
2. 函数组件 + React Hooks，禁止class组件
3. 页面放 src/pages，公共组件 src/components
4. scss写样式，遵循Taro3官方规范
5. 路由统一在 app.config.ts 注册
6. Prettier格式化，不引入多余第三方依赖

## 工作规则
1. 修改文件前，先列出文件清单 + 展示diff，等待我确认再写入磁盘
2. 不确定需求先提问，不要自行猜测
3. 任务完成输出文件清单 + 验证步骤
4. 执行终端命令，返回完整输出

## 跨端开发约束（Taro3）
1. 样式优先使用flex布局，慎用web专属css，兼顾 H5 / 微信 / 支付宝 / 抖音小程序、React Native。
2. 文本多行省略，必须兼容所有目标端。
3. 布局单位统一使用rpx。
4. 不使用小程序私有css选择器，不使用RN不支持的属性。

## 要求
将提示词记录到根目目录 提示词.md中