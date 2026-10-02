# LinkNest 服务器部署

## 当前目标

- 网站：`https://nest.tangsu.me/`
- 服务器：Debian 13；实际连接参数保存在私有服务器维护记录中。
- SSH：使用维护账号和已授权密钥连接，支持 `sudo -i`；账号、端口和密钥路径不放入公开仓库。
- Web 服务：Caddy 官方稳定源 `2.11.4`，由 systemd 管理；已解决 Debian 旧版与 Cloudflare 混合后量子密钥交换不兼容的问题
- 网站类型：纯静态；无需在服务器安装 Node.js、数据库或容器
- 收藏、语言和主题保存在各浏览器 localStorage；更换域名后，原域名下的浏览器设置不会自动迁移

## DNS 与 HTTPS

- `nest.tangsu.me` 的 A 记录应指向实际源站公网 IP。
- 当前源站没有公网 IPv6，不配置指向源站的 AAAA 记录。Cloudflare 代理自动返回的边缘 IPv6 地址正常。
- 当前已开启 Cloudflare 代理，用户确认 SSL/TLS 为 **Full (strict) / 完全（严格）**；源站证书已通过代理下的 HTTP-01 校验签发。保留 HTTP 80 以供重定向和证书验证。
- 开放 TCP `80`、`443`；SSH 保持 `1519`。Caddy 配置启用 HTTP/1.1 和 HTTP/2，不依赖 UDP 443。
- 正式配置为本目录的 `Caddyfile`。Caddy 自动签发、续期证书并将 HTTP 重定向到 HTTPS。
- 2026-09-29 已启用正式 HTTPS；Cloudflare 公网 HTTP 一次跳转到 HTTPS，首页和资源验证为 200，404 返回正常。
- 当前源站证书由 Let’s Encrypt YE2 签发，有效期至 `2026-12-27 17:08:46 UTC`；由 Caddy 自动续期。

## 服务器路径

| 内容 | 路径 |
| --- | --- |
| 当前发布 | `/var/www/linknest/current`（指向一个版本目录） |
| 各次发布 | `/var/www/linknest/releases/<时间标识>/` |
| Caddy 配置 | `/etc/caddy/Caddyfile` |
| Caddy 证书与 ACME 状态 | `/var/lib/caddy/.local/share/caddy/`（由 caddy 用户管理） |
| 部署前配置备份 | `/var/backups/<站点部署备份目录>/` |
| 服务日志 | `journalctl -u caddy` |

站点文件归 root 所有，目录 `755`、文件 `644`；Caddy 仅需读取。仅上传 `dist/`，不公开源码、私钥或本机依赖。HTML / SEO 文件不长期缓存；带内容哈希的构建资源可缓存一年。

## 更新流程

1. 在本机项目根目录使用 `.nvmrc` 指定的 Node.js 24，运行 `npm ci`、`npm test`、`npm run build`。
2. 打包 `dist/` 中的文件，传到服务器维护账号目录；macOS 打包时可设置 `COPYFILE_DISABLE=1` 避免额外的扩展属性文件。
3. 在服务器新建 `/var/www/linknest/releases/<新时间标识>`，解压并设置 root 所有权、目录 `755`、文件 `644`。
4. 核对上传包 SHA256 和关键文件后，将 `current` 链接原子切换到新版本；保留上一版本供回滚。不要覆盖正在提供服务的版本目录。
5. 若配置有变化，先 `sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`，再 `sudo systemctl reload caddy`。仅切换静态版本无需重启服务。
6. 验证 HTTPS、HTTP 跳转、首页、搜索 / 收藏、图片及 404，并更新服务器操作记录。

macOS 可通过 Wi-Fi `en0` 直连，以避开虚拟网络路径超时。先按私有维护记录填写下列连接参数：

```bash
ssh -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o 'ProxyCommand=nc -b en0 -G 12 %h %p' \
  -i "$LINKNEST_SSH_KEY" -p "$LINKNEST_SSH_PORT" "$LINKNEST_SSH_USER@$LINKNEST_SERVER_IP"
```

不同环境使用各自的私钥路径；对应公钥需已获服务器授权，不能假定与 Mac 的密钥相同。

## 检查与回滚

```bash
sudo systemctl status caddy --no-pager
sudo journalctl -u caddy -n 50 --no-pager
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
curl -I https://nest.tangsu.me/
curl -I http://nest.tangsu.me/
```

内容回滚：将 `current` 原子切回已验证的上一版本；首次发布尚无上一业务版本。配置回滚：从部署前备份恢复相应配置，先验证语法，再重载。防火墙恢复旧备份会关闭网站的 80/443，需按影响范围选择恢复内容。

`releases` 是本机版本留存，不是异地备份。源代码仍在本地 Git 仓库；后续按需要备份 Caddy 配置、证书状态和站点发布包。

## Caddy 维护与兼容性

- 使用 [Caddy 官方稳定软件源](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)，APT 配置位于 `/etc/apt/sources.list.d/caddy-stable.list`，签名公钥为 `/usr/share/keyrings/caddy-stable-archive-keyring.gpg`。
- `/etc/apt/preferences.d/caddy-official` 优先从此源获取 `caddy`，其他包保持低优先级；保留发行版软件源。
- 服务器现有自动安全更新仅允许 Debian security，不包含 Caddy 官方源。因此 Caddy 软件包升级需在维护时检查并执行；这不影响 Caddy 自动续期站点证书。
- 2026-09-29 排查发现 Cloudflare 握手只提供混合后量子组 `0x11ec` / `0xfe32`，旧版 Caddy 2.6.2 报无共同密钥交换参数，公网返回 525。升级至官方 2.11.4 并使用默认 TLS 参数后恢复。最终配置没有保留临时 debug 或手动曲线限制，也未降低 Cloudflare 加密模式。
- Cloudflare 的加密模式与密钥交换要求是独立设置，参见 [Cloudflare 官方说明](https://developers.cloudflare.com/ssl/origin-configuration/automatic-key-exchange/)。后续回滚 Caddy 时应保留对此握手方式的支持。
- 发布验收：源站 TLS 校验、本机与服务器经 Cloudflare 的 HTTPS、HTTP 跳转、JS / CSS / 字体 / 图片 / robots / sitemap、404 均通过；`.env` 和源文件路径返回 404。浏览器自动化服务本次连接超时，未完成实际点击交互验收；本地 7 项项目测试及构建通过。
