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

- `src/data/catalog.json` 是唯一网址数据源，包含 73 条网址和 15 个分类。每个网址包含稳定 `id`、分类、URL、本地图标（暂缺时为 `null`）和 `zh` / `en` 名称、介绍。修改名称时保留 `id`，避免丢失已存收藏。
- `src/i18n.ts` 管理界面文案；`src/styles.css` 管理主题、间距、圆角、响应式断点和动效。
- `public/assets/images/` 存放品牌和网站图标；图标加载失败时显示默认图标。书签图标统一放在 `logos/`，按品牌或域名使用小写英文名称，多个词用短横线连接（如 `google-fonts.png`、`synology-photos.png`）。相同服务共用一份图标；重命名时同步更新 `catalog.json` 的 `icon` 引用。

### 分类结构

| 分组 | 分类与书签数 |
| --- | --- |
| 日常浏览 | 搜索与 AI（4）、个人云（9）、科技与社区（7）、金融服务（3） |
| 影音资源 | 视频与直播（3）、PT 与下载（3） |
| 效率工具 | 图片处理（4）、账号与办公（6） |
| 开发与网络 | 开发与运维（7）、域名与 DNS（4）、云主机与托管（7）、网络与连接（4） |
| 灵感与设计 | 设计灵感（2）、字体资源（4）、图片与摄影（6） |

“个人云”保留原分类、条目内容和排列顺序。其余条目按用途归类，多用途网站按主要用途放入一个分类，例如 Njalla 放入“域名与 DNS”，开源镜像站放入“开发与运维”。重分类保留所有书签 ID，不影响已存收藏。

### 新增书签图标来源

图标从对应站点公开的 favicon、Apple touch icon 或品牌图片下载，保存为本地文件，不依赖第三方图标代理。

| 书签 | 本地文件（位于 `public/assets/images/logos/`） | 来源 |
| --- | --- | --- |
| App Store Connect | `app-store-connect.ico` | [官网 favicon](https://appstoreconnect.apple.com/favicon.ico) |
| Apple 账号 | `apple-account.png` | [Apple 账号图标](https://appleid.cdn-apple.com/static/bin/cb3400246193/images/accountIcons/icon-192x192.png) |
| GitHub | `github.png` | [官网 favicon](https://github.githubassets.com/favicons/favicon.png) |
| 宝贝云 | `baobei-cloud.png` | [官网品牌图片](https://file.bbyvpn.com/d/img/frontico.png) |
| 袋鼠VPN | `daishu-vpn.png` | [网站 touch icon](https://daishu.love/assets/logo.png) |
| Hostinger | `hostinger.png` | [hPanel touch icon](https://hpanel.hostinger.com/favicons/hostinger-apple-touch-icon.png) |
| Nextcli | `nextcli.png` | [官网 favicon](https://my.nextcli.com/templates/lagom2/assets/img/favicons/favicon-192.png) |
| Gname | `gname.ico` | [官网 favicon](https://file-sg.gname.net/f/favicon.ico) |
| 云悠 | `yunyoo.ico` | [官网 favicon](https://yunyoo.cc/favicon.ico) |
| 汇丰 | `hsbc.png` | [官网 touch icon](https://www.hsbc.com.hk/etc.clientlibs/dpws/clientlibs-public/clientlib-site/resources/favicons/apple-touch-icon.png) |
| 盈透 | `interactive-brokers.png` | [官网图标](https://www.interactivebrokers.com/images/web/favicons/home-screen-icon-192x192.png) |
| 抖音 | `douyin.ico` | [官网 favicon](https://www.douyin.com/favicon.ico) |
| 阿里云 | `aliyun.ico` | [官网声明的 favicon](https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico) |
| Apple 官网 | `apple.ico` | [官网 favicon](https://www.apple.com/favicon.ico) |
| iCloud | `icloud.png` | [官网 touch icon](https://www.icloud.com/system/icloud.com/2634Build50/favicons/default-favicon-light-180x180.png) |
| Yahoo 香港 | `yahoo-hk.png` | [官网 touch icon](https://s.yimg.com/cv/apiv2/twapp/apple-touch-icon@167x167.png) |
| Proton | `proton.png` | [官网 touch icon](https://proton.me/favicons/apple-touch-icon.png) |
| 踏浪鸭 | `talangya.png` | [官网品牌图片](https://talangya.com/app/View/User/Theme/FatChicken/logo.png) |
| ConoHa | `conoha.png` | [官网 favicon](https://www.conoha.jp/wing_59681/common/images/favicon.png) |
| Kraken | `kraken.png` | [官网 touch icon](https://www.kraken.com/_assets/icons/apple-touch-icon.png) |
| NEXT, ITELLYOU | `itellyou.ico` | [官网 favicon](https://next.itellyou.cn/favicon.ico) |
| RackNerd | `racknerd.png` | [官网 favicon](https://www.racknerd.com/favicon.png) |

Njalla 的官方图标暂未取得（下载连接失败），目前 `icon` 为 `null`，直接显示默认地球图标。补充方式：

1. 将图片放到 `public/assets/images/logos/njalla.png`，建议使用透明背景的正方形 PNG。
2. 在 `src/data/catalog.json` 中找到 Njalla，将 `"icon": null` 改为 `"icon": "assets/images/logos/njalla.png"`。

搬瓦工官网的 favicon 返回 404，目前仅找到 [814 × 100 的横版文字 Logo](https://bandwagonhost.com/templates/organicbandwagon/images/logo4.png)，缩小到书签图标尺寸后难以辨认，因此暂用默认地球图标。补充方式：

1. 将合适的正方形 PNG 放到 `public/assets/images/logos/bandwagonhost.png`。
2. 在 `src/data/catalog.json` 中找到搬瓦工，将 `"icon": null` 改为 `"icon": "assets/images/logos/bandwagonhost.png"`。

`daishu.love` 当前页面标题为“袋鼠小站”；书签沿用用户指定的“袋鼠VPN”名称和原网址。

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

网址按个人使用需求持续增删；保留条目中包含私人 NAS 端口地址与 HTTP 链接。已清理空分类，按实际用途组织导航。移除书签后，其余本地收藏继续保留。

原版基于 WebStack，站点与内容整理者为 Tangsu。
