# LinkNest / Tangsu.house

个人网址导航，使用 React、TypeScript 和 Vite 构建。中英文共用同一个页面，支持自动语言、深浅主题、搜索和本地收藏。

## 本地运行

需要 Node.js 22.12+，推荐 Node.js 24（项目提供 `.nvmrc`）。

```sh
nvm use
npm ci
npm run dev
```

```sh
npm test         # 数据完整性、语言匹配、跨语言搜索
npm run build    # TypeScript 检查和生产构建
npm run preview  # 预览构建后的 dist 目录
```

## 项目结构

```text
.github/workflows/   GitHub Pages 发布流程
public/              静态图片、404 页面、域名和 SEO 文件
src/
  components/        网站卡片、图标与提示消息
  data/catalog.json  网址和分类数据
  App.tsx            页面布局与交互
  i18n.ts            中英文界面文案
  lib.ts             搜索、语言和本地设置工具
  main.tsx           应用入口
  styles.css         主题、布局与动效
  types.ts           数据类型
tests/              自动化测试
index.html           唯一页面入口
```

`node_modules/` 为本地依赖，`dist/` 为可重新生成的构建产物，都不提交到 Git。类型检查不会生成根目录缓存文件。

## 维护网站与文案

- `src/data/catalog.json` 是唯一网址数据源，包含 76 条网址和 18 个分类。每个网址包含稳定 `id`、分类、URL、本地图标和 `zh` / `en` 名称、介绍。修改名称时保留 `id`，避免丢失已存收藏。
- `src/i18n.ts` 管理界面文案；`src/styles.css` 管理主题、间距、圆角、响应式断点和动效。
- `public/assets/images/` 存放品牌和网站图标；图标加载失败时显示默认图标。

语言依据 `navigator.languages` 中第一个支持的语言选择：`zh-*` 使用中文，`en-*` 使用英文，其余回退英文。手动设置优先，并可切回“跟随系统”。切换语言时不跳转、不重载。

主题默认跟随系统。收藏、语言、主题和视图仅保存在当前浏览器的 localStorage，没有服务器同步；存储受限时本次使用仍然有效，并提示设置不能持久化。页面不加载第三方统计或广告脚本。

## 页面与交互

- 统一入口 `/`，分类使用数据中的 `anchor` 定位，`/#about` 为关于页面。
- 搜索匹配中英文名称、介绍和域名，支持多个关键词。
- `/` 或 `⌘K` / `Ctrl+K` 聚焦搜索。
- 星标收藏、快速访问、分类筛选、网格 / 列表视图。
- 深浅主题、手机分类抽屉、键盘焦点约束、Escape 关闭。
- 尊重系统的减少动态效果设置。

旧 `/cn/`、`/en/` 页面与跳转文件已移除，旧 `#界面灵感` 别名不再支持。所有语言均使用统一入口。

## 发布

运行 `npm run build` 后发布纯静态 `dist/`，不要直接发布源代码目录。

`.github/workflows/deploy.yml` 在 `main` 推送后测试、构建并发布 GitHub Pages。仓库 Settings → Pages 的 Source 需要设为 **GitHub Actions**，也可以手动触发工作流。

`public/CNAME` 是域名配置的唯一来源，当前为 `tangsu.house`。如更换域名，同时更新此文件、`index.html` 中的 Open Graph URL、`public/robots.txt` 和 `public/sitemap.xml`。Vite 使用相对构建路径，默认部署目标是自定义域名根目录。`public/404.html` 是发布用的错误页面。

## 内容说明

原有网址目的地全部保留，包括私人 NAS 端口地址与 HTTP 链接。原数据里“爱范儿”指向雷锋网，可在数据文件中单独校正。游戏娱乐和 Chrome 插件分类暂无条目，提供空状态。

原版基于 WebStack，站点与内容整理者为 Tangsu。
