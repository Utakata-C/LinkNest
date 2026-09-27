# LinkNest / Tangsu.house

个人网址导航。将旧版 jQuery、Bootstrap、Xenon 模板重构为 React + TypeScript + Vite 单页应用，完整保留 76 条网址、18 个分类及 Tangsu 品牌素材。

## 本地运行

需要 Node.js 22.12+，推荐 Node.js 24（项目提供 `.nvmrc`）。原项目环境中的 Node.js 16 不支持新构建工具。

```sh
nvm use
npm ci
npm run dev
```

```sh
npm test          # 数据完整性、语言匹配、跨语言搜索
npm run build    # TypeScript 检查和生产构建
npm run preview  # 预览 dist 目录
```

## 维护网站与文案

- `src/data/catalog.json`：唯一网址数据源。每个网址包含稳定 `id`、分类、URL、本地图标、`zh` / `en` 名称和介绍。修改名称时保留 `id`，避免丢失已存收藏。
- `src/i18n.ts`：界面中英文文案。
- `src/styles.css`：语义颜色、间距、圆角、响应式断点、减少动态效果设置。
- `src/components/BookmarkCard.tsx`：网站卡片和失效图标回退。
- `public/assets/images/`：原项目品牌和网站图标，均本地提供。

语言默认依据 `navigator.languages` 中第一个支持的语言选择：`zh-*` 使用中文，`en-*` 使用英文，其余回退英文。手动设置优先，并可切回“跟随系统”。页面切换语言时不跳转、不重载。主题默认跟随系统；收藏、语言、主题、视图仅保存在当前浏览器的 localStorage，没有服务器同步。存储受限时仍可使用，并提示设置不能持久化。

## 页面与交互

- 中英文共用一个入口、同一份结构化数据。
- 搜索匹配中英文名称、介绍和域名；支持多个关键词。
- `/` 或 `⌘K` / `Ctrl+K` 聚焦搜索。
- 星标收藏、快速访问、分类筛选、网格 / 列表视图。
- 深浅主题、手机分类抽屉、原生键盘焦点约束、Escape 关闭。
- 减少动态效果偏好下禁用动效，图片加载失败时使用图标回退。
- `#about` 为关于页面，保留原作者介绍。

`/cn/index.html`、`/en/index.html`、`/cn/`、`/en/` 仅为兼容跳转，不再维护两份页面。旧分类 hash 会传递到统一页面，个人云原来错误的 `#界面灵感` 也作为别名保留。两种语言的旧 about 路径都跳转到 `/#about`。这些入口不会覆盖浏览器语言或用户的手动偏好。

## 发布

产物是纯静态 `dist/`，可部署到 GitHub Pages 或任意静态托管服务。请发布构建产物，不要直接发布源代码目录。

已提供 `.github/workflows/deploy.yml`，在 `main` 或 `master` 推送后测试、构建并发布 Pages。仓库 Settings → Pages 的 Source 需要设为 **GitHub Actions**。本次重构只添加发布配置，不会自行推送或上线。

`public/CNAME` 保留 `tangsu.house`。如更换域名，同时更新 CNAME、HTML 的 Open Graph URL、robots.txt、sitemap.xml 和旧入口 canonical。Vite 使用相对构建路径；默认部署目标仍是现有自定义域名根目录。

旧版百度统计、AdSense 和 GA 的原始 ID 保留在 `src/legacy-integrations.ts`，仅在生产构建且域名为 `tangsu.house` 时加载，本地和预览不会发送统计。GA 的 `UA-...` 为历史配置；是否更新或取消这些服务应由站点所有者决定。构建时设置 `VITE_LEGACY_INTEGRATIONS=false` 可禁用全部旧集成。

## 迁移范围

原有网址目的地全部保留，包括私人 NAS 的端口地址与旧 HTTP 链接，没有对外部服务做登录或可用性检查。原数据里“爱范儿”指向雷锋网，暂保留该原始地址，后续可在数据文件中单独校正。两个原本为空的分类（游戏娱乐、Chrome 插件）保留导航并提供空状态。

原版基于 WebStack，站点与内容整理者为 Tangsu。
