# Screen MCP dev 服务器发布与运维手册

## 1. 文档目的

本文用于把 `screen-component-mcp` 发布到 dev 服务器，并交付给运维工程师持续启动、停止、升级、验证和回滚。

本项目是大屏编辑器 schema 的能力编译器，不是大屏模板生成器。LLM 负责主题、颜色、模块、布局、文案、装饰和组件组合等设计决策；MCP 负责暴露能力、校验输入、合并默认 props，并编译完整编辑器 schema。

本文基于仓库当前实现，推荐采用以下 dev 环境拓扑：

```text
MCP Client
    |
    | HTTPS :443
    v
Nginx / 公司网关（TLS + 鉴权或来源限制）
    |
    | HTTP 127.0.0.1:3460
    v
screen-component-mcp（Node.js，单实例，systemd 托管）
```

这里发布的是 Streamable HTTP MCP 服务，公共端点为 `https://mcp-dev.example.com/mcp`。

## 2. 当前服务事实与限制

运维方案必须遵循下列事实：

| 项目 | 当前实现 |
| --- | --- |
| 运行时 | Node.js `>=18`；仓库 `.nvmrc` 固定为 `20.19.0`，服务器推荐使用该版本 |
| 开发 HTTP 命令 | `npm run dev:http`，使用 `tsx` 直接运行源码 |
| 部署 HTTP 命令 | `npm run build` 后运行 `npm run start:http`，实际入口为 `dist/src/http-server.js` |
| stdio 命令 | `npm run dev` / `npm start`，只适合 MCP 客户端在本机拉起子进程，不提供远程 HTTP 服务 |
| 默认监听 | `127.0.0.1:3460` |
| MCP 路径 | `/mcp`，支持 `POST`、`GET`、`DELETE`、`OPTIONS` |
| 请求体限制 | 10 MB；网关限制不得低于应用限制，也不建议高于应用限制 |
| 运行时依赖 | 无数据库、Redis、消息队列和持久化目录；当前运行代码不主动访问外部网络，也不写业务文件 |
| 会话 | 保存在当前 Node.js 进程内存中；重启后全部失效 |
| 多实例 | 当前不应直接启用。多实例会导致后续请求落到没有该会话的进程，返回 `Session not found` |
| 鉴权 | 应用没有内置鉴权和限流 |
| TLS | 应用只提供 HTTP，TLS 必须在 Nginx、Ingress 或公司 API 网关终止 |
| CORS | 应用返回 `Access-Control-Allow-Origin: *`；安全边界必须由网关和网络策略提供 |
| 健康检查 | 当前没有专用 `/health` 或 `/ready` 路由 |
| 日志 | 输出到 stdout/stderr；systemd 部署后由 journald 接收 |
| 优雅退出 | 当前代码处理 `SIGINT`；systemd 必须设置 `KillSignal=SIGINT` |

`MCP_ALLOWED_HOSTS` 只防御伪造 Host/DNS rebinding，不等同于身份认证。即使配置了该变量，也不能把 3460 端口直接暴露到公网。

## 3. 发布前需要明确的信息

研发负责人在提单时提供：

| 信息 | 示例 | 要求 |
| --- | --- | --- |
| 仓库地址 | `https://github.com/Jveen-D/screen-mcp.git` | 私有仓库使用只读 deploy key，不要把 Token 写进 URL |
| 发布提交 | 完整 40 位 Git commit SHA | 必须是已推送且通过检查的不可变提交，不直接以浮动的 `main` 作为发布标识 |
| 环境 | `dev` | 本文只覆盖 dev |
| 对外域名 | `mcp-dev.example.com` | 提前完成 DNS 和证书准备 |
| 访问范围 | 公司 VPN 网段、跳板机出口 IP 或网关用户组 | 不允许匿名公网访问 |
| 变更窗口 | 日期、开始时间、预计时长 | 重启会中断现有 MCP 会话，客户端需要重新初始化 |
| 回滚提交 | 上一个已验收 commit SHA | 首次发布可以标记为无 |
| 验收人 | 研发或测试负责人 | 需要能使用 MCP 客户端调用工具 |

运维负责人准备：

- 一台 Linux x86_64 dev 服务器，建议初始规格不低于 1 vCPU、1 GiB 内存和 5 GiB 可用磁盘。该规格是 dev 起步值，不代表容量测试结论。
- Node.js `20.19.0`、npm、Git、Nginx 和 systemd。
- 到 Git 仓库和 npm registry 的发布期出站访问。如果运行期不需要，可在发布完成后按公司策略收紧。
- 入站只开放 443。应用端口 3460 只监听环回地址，不开放防火墙规则。
- TLS 证书，以及公司网关鉴权、VPN 网段或来源 IP 白名单中的至少一种访问控制。
- 日志和主机指标采集能力。

## 4. 研发发布前检查

在准备发布的提交上执行：

```bash
git status --short
npm ci
npm run check
git rev-parse HEAD
```

预期结果：

- `git status --short` 没有未提交的发布相关改动。
- `npm ci` 按 `package-lock.json` 安装成功。
- `npm run check` 全部通过。该命令包括 BlackHole catalog 同步检查、TypeScript 构建、流程测试、文档检查和项目规则检查。
- `dist/src/http-server.js` 已生成。
- 将 `git rev-parse HEAD` 输出的完整 SHA 交给运维。

这是服务部署，不是 npm 包发布。`package.json` 当前为 `private: true`，不要执行 `npm publish`。当前 `serverVersion` 仍是 `0.1.0`，部署身份应以 Git commit SHA 和发布目录为准，不能只看版本号。

## 5. 本地启动方式

### 5.1 开发模式

```bash
npm ci
npm run dev:http
```

默认端点为 `http://127.0.0.1:3460/mcp`。该方式依赖 devDependencies，只用于开发调试。

### 5.2 构建后模拟部署启动

Linux/macOS：

```bash
npm ci
npm run build
HOST=127.0.0.1 PORT=3460 MCP_ALLOWED_HOSTS=localhost,127.0.0.1 npm run start:http
```

PowerShell：

```powershell
npm ci
npm run build
$env:HOST = "127.0.0.1"
$env:PORT = "3460"
$env:MCP_ALLOWED_HOSTS = "localhost,127.0.0.1"
npm run start:http
```

看到以下两行日志说明监听成功：

```text
Screen MCP HTTP server running at http://127.0.0.1:3460
Streamable HTTP endpoint: http://127.0.0.1:3460/mcp
```

不要在服务器上用 `npm run dev:http` 长期运行，也不要用 `nohup` 代替服务管理器。

## 6. 首次部署

以下命令以 Ubuntu/Debian 类 Linux、systemd、同机 Nginx 为例。其他发行版可以调整包安装命令，但目录、环境变量和启动入口保持一致。

### 6.1 校验运行时

按公司软件源规范安装 Node.js，不建议在 systemd 服务中依赖交互式 shell 的 nvm 初始化。安装后执行：

```bash
node --version
npm --version
command -v node
```

预期 Node.js 为 `v20.19.0`。后面的 systemd 示例假设 `command -v node` 返回 `/usr/bin/node`；若实际路径不同，必须同步修改 `ExecStart`。

### 6.2 创建服务用户和目录

以下操作只需执行一次：

```bash
sudo useradd --system --create-home --home-dir /opt/screen-mcp --shell /usr/sbin/nologin screen-mcp
sudo install -d -o screen-mcp -g screen-mcp -m 0750 /opt/screen-mcp/releases
sudo install -d -o root -g screen-mcp -m 0750 /etc/screen-mcp
```

如果 `screen-mcp` 用户已经存在，不要重复创建；先用 `id screen-mcp` 和 `getent passwd screen-mcp` 核对 UID、组和 home 目录。

### 6.3 拉取不可变发布提交

把下面示例中的 `RELEASE_REF` 替换成研发提供的完整 commit SHA：

```bash
REPOSITORY_URL='https://github.com/Jveen-D/screen-mcp.git'
RELEASE_REF='0123456789abcdef0123456789abcdef01234567'
RELEASE_ID="$(date +%Y%m%d%H%M%S)-$(printf '%s' "$RELEASE_REF" | cut -c1-8)"
RELEASE_DIR="/opt/screen-mcp/releases/$RELEASE_ID"

sudo -u screen-mcp git clone --no-checkout "$REPOSITORY_URL" "$RELEASE_DIR"
sudo -u screen-mcp git -C "$RELEASE_DIR" checkout --detach "$RELEASE_REF"
sudo -u screen-mcp git -C "$RELEASE_DIR" rev-parse HEAD
```

最后一条命令的输出必须与 `RELEASE_REF` 完全相同。私有仓库应事先为服务用户配置只读 deploy key；不要在 shell 历史、systemd 环境文件或 Git remote 中保存个人访问令牌。

### 6.4 安装、检查和构建

```bash
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" ci
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" run check
test -f "$RELEASE_DIR/dist/src/http-server.js"
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" prune --omit=dev
```

规则如下：

- 必须使用 `npm ci`，不能用 `npm install` 改写锁文件。
- `npm run check` 未全部通过时停止发布，不切换 `current` 软链接。
- `npm prune --omit=dev` 在检查完成后移除编译和测试依赖，保留运行依赖。
- 不要直接复制开发机现有的 `node_modules`，以免操作系统、CPU 架构或 Node ABI 不一致。

### 6.5 配置应用环境变量

创建 `/etc/screen-mcp/screen-mcp.env`：

```ini
NODE_ENV=production
HOST=127.0.0.1
PORT=3460
MCP_ALLOWED_HOSTS=mcp-dev.example.com,localhost,127.0.0.1
```

然后设置权限：

```bash
sudo chown root:screen-mcp /etc/screen-mcp/screen-mcp.env
sudo chmod 0640 /etc/screen-mcp/screen-mcp.env
```

变量说明：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | 推荐 | 固定为 `production` |
| `HOST` | 是 | 同机 Nginx 时使用 `127.0.0.1`；只有容器或跨主机代理确有需要时才使用 `0.0.0.0` |
| `PORT` | 是 | 默认 `3460`；修改时同步修改 systemd 验证、Nginx upstream 和监控 |
| `MCP_ALLOWED_HOSTS` | 是 | 逗号分隔的主机名，不带协议和端口。至少包含对外域名；保留本机名便于本机检查 |

当前应用没有业务密钥。以后如果新增密钥，不得提交 `.env`，应使用公司密钥管理系统或受限权限的 systemd EnvironmentFile。

### 6.6 配置 systemd

创建 `/etc/systemd/system/screen-mcp.service`：

```ini
[Unit]
Description=Screen Component MCP HTTP Server
After=network.target

[Service]
Type=simple
User=screen-mcp
Group=screen-mcp
WorkingDirectory=/opt/screen-mcp/current
EnvironmentFile=/etc/screen-mcp/screen-mcp.env
ExecStartPre=/usr/bin/test -f /opt/screen-mcp/current/dist/src/http-server.js
ExecStart=/usr/bin/node /opt/screen-mcp/current/dist/src/http-server.js
Restart=on-failure
RestartSec=5s
KillSignal=SIGINT
TimeoutStopSec=30s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=screen-mcp
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
UMask=0027

[Install]
WantedBy=multi-user.target
```

首次切换发布目录并启动：

```bash
sudo ln -sfnT "$RELEASE_DIR" /opt/screen-mcp/current
readlink -f /opt/screen-mcp/current
sudo systemctl daemon-reload
sudo systemctl enable --now screen-mcp
sudo systemctl status screen-mcp --no-pager
```

`readlink` 输出必须是刚刚构建完成的发布目录。服务应为 `active (running)`，且日志中应出现 3460 和 `/mcp` 的监听信息。

### 6.7 配置 Nginx、TLS 和访问控制

应用没有内置鉴权。dev 环境至少应限制到公司 VPN/内网来源；如果端点可从公网路由，必须在公司网关增加 OAuth、mTLS 或等价认证。下面以来源网段限制为例，示例网段必须替换为真实值：

```nginx
server {
    listen 443 ssl http2;
    server_name mcp-dev.example.com;

    ssl_certificate     /etc/nginx/tls/mcp-dev.example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/mcp-dev.example.com/privkey.pem;

    client_max_body_size 10m;

    location = /mcp {
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://127.0.0.1:3460;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        proxy_buffering off;
        proxy_request_buffering off;
        proxy_cache off;
        gzip off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location / {
        return 404;
    }
}
```

注意事项：

- 不要开启响应缓冲；MCP 的 GET 流式连接可能长时间保持。
- 必须透传原始 `Host`，并让它出现在 `MCP_ALLOWED_HOSTS` 中，否则应用返回 403。
- 不要只代理 POST。MCP 会用 GET 建立流、用 DELETE 关闭会话，并可能由浏览器发出 OPTIONS 预检。
- 如果 Nginx 前还有负载均衡器，来源限制应基于正确恢复后的客户端 IP；不要误把负载均衡器地址当作最终用户身份。
- 配置网关鉴权时要确认 OPTIONS 预检和长连接不会被误拦截，并确认客户端能携带要求的认证头。

检查并加载 Nginx 配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

防火墙或安全组只放行 443 到受控来源，不放行 3460。

## 7. 部署验收

### 7.1 进程与监听检查

```bash
systemctl is-active screen-mcp
systemctl show screen-mcp -p MainPID -p NRestarts
sudo ss -lntp | grep ':3460'
journalctl -u screen-mcp -n 100 --no-pager
```

预期：

- `systemctl is-active` 返回 `active`。
- 3460 只监听 `127.0.0.1`，不是 `0.0.0.0`。
- 日志中没有持续出现的启动异常或请求异常。

### 7.2 本机浅层检查

当前没有 `/health`。访问 `/mcp` 但不带会话头时，应用会按协议返回 400，这可以证明进程、端口、Host 校验和路由都已工作：

```bash
curl --include --header 'Host: mcp-dev.example.com' http://127.0.0.1:3460/mcp
```

预期 HTTP 状态为 400，响应包含 `Missing mcp-session-id header`。不要把这个 400 当成业务故障，也不要把 `/mcp` 配成只接受 2xx 的负载均衡健康检查。

### 7.3 MCP 初始化检查

从允许访问 dev 域名的机器执行：

```bash
curl --include --request POST 'https://mcp-dev.example.com/mcp' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"deploy-check","version":"1.0.0"}}}'
```

预期：

- HTTP 状态为 200。
- 响应头包含 `mcp-session-id`。
- 响应体的 `serverInfo.name` 为 `screen-component-mcp`。

记录响应头中的会话 ID，并在检查完成后关闭测试会话：

```bash
SESSION_ID='把 initialize 响应头中的 mcp-session-id 填在这里'

curl --include --request DELETE 'https://mcp-dev.example.com/mcp' \
  --header "mcp-session-id: $SESSION_ID" \
  --header 'MCP-Protocol-Version: 2025-06-18'
```

预期 DELETE 返回 200。使用 MCP 客户端或 Inspector 验收时应由客户端正常关闭会话；异常中断的测试会话会一直占用进程内存，直到 transport 被关闭或服务重启。

如果网关启用了认证，上述请求必须按网关要求添加认证信息。不要把真实凭据写进工单、Git 或共享聊天记录。

### 7.4 功能验收

用支持 Streamable HTTP 的 MCP 客户端或 MCP Inspector 连接：

```text
https://mcp-dev.example.com/mcp
```

依次检查：

1. 能列出工具，并确认包含 `get_server_diagnostics`、`list_components`、`validate_dashboard_spec` 和 `generate_dashboard_schema`。
2. 调用 `get_server_diagnostics`，确认 `source.entryFile` 指向本次 release 的 `dist/src/http-server.js`（Node.js 可能把 `current` 软链接解析为实际 release 目录），Node 版本正确，`startedAt` 与本次发布时间一致。
3. 调用 `list_components`，确认返回非空组件列表。
4. 按项目正常流程使用一份研发提供的最小 DashboardSpec 调用 `validate_dashboard_spec`，再调用 `generate_dashboard_schema`。
5. 确认 MCP 只执行能力说明、校验和 schema 编译，没有替 LLM 固定主题、布局或组件组合。

功能验收通过后，记录以下发布证据：Git SHA、发布时间、发布目录、systemd 主 PID、诊断输出中的 `rulesVersion`、验收人和验收结果。

## 8. 日常发布流程

每次发布都创建新目录，不在 `/opt/screen-mcp/current` 中直接 `git pull` 或覆盖文件。

1. 按 6.3 和 6.4 创建并构建新的 release 目录。
2. 记录当前版本：`readlink -f /opt/screen-mcp/current`。
3. 确认新版本 `npm run check` 全部通过。
4. 在变更窗口内切换软链接并重启。

```bash
PREVIOUS_RELEASE="$(readlink -f /opt/screen-mcp/current)"
sudo ln -sfnT "$RELEASE_DIR" /opt/screen-mcp/current
sudo systemctl restart screen-mcp
sudo systemctl status screen-mcp --no-pager
readlink -f /opt/screen-mcp/current
```

5. 完成第 7 章所有验收。
6. 把 `PREVIOUS_RELEASE` 记录到发布单，至少保留一个已验证的旧 release 目录。

服务重启会清空内存会话。发布通知中应要求客户端在重启后重新 initialize。当前不支持无损滚动升级，不应在有重要长连接任务执行时强制重启。

## 9. 回滚

出现以下任一情况应优先回滚：

- 服务无法启动或反复重启。
- MCP 初始化、工具列表或关键编译流程失败。
- 新版本持续产生异常 5xx、明显内存增长或不可接受的响应延迟。
- 发布提交或产物与发布单记录不一致。

回滚步骤：

```bash
ROLLBACK_DIR='/opt/screen-mcp/releases/上一已验证发布目录'
test -f "$ROLLBACK_DIR/dist/src/http-server.js"
sudo ln -sfnT "$ROLLBACK_DIR" /opt/screen-mcp/current
sudo systemctl restart screen-mcp
sudo systemctl status screen-mcp --no-pager
readlink -f /opt/screen-mcp/current
```

随后重复第 7 章验收，并记录失败版本、回滚版本、时间和原因。应用当前没有数据库或持久化数据，因此没有数据迁移回滚；回滚的核心是恢复代码、依赖和配置的兼容组合。不要在问题定位完成前删除失败 release。

环境文件、systemd 或 Nginx 有变更时，代码回滚不会自动恢复这些配置。每次配置变更都必须单独保存变更前版本，并在回滚单中明确是否需要一并恢复。

## 10. 日常运维

### 10.1 常用命令

```bash
sudo systemctl status screen-mcp --no-pager
sudo systemctl restart screen-mcp
sudo systemctl stop screen-mcp
sudo systemctl start screen-mcp
journalctl -u screen-mcp -f
journalctl -u screen-mcp --since '30 minutes ago' --no-pager
readlink -f /opt/screen-mcp/current
git -C /opt/screen-mcp/current rev-parse HEAD
```

### 10.2 建议监控项

- `screen-mcp.service` 是否 active、最近重启次数和退出码。
- Node 进程 CPU、RSS 内存、文件描述符和主机磁盘余量。
- Nginx `/mcp` 请求量、4xx/5xx、响应时间、活动长连接和 499。
- 定时执行 MCP initialize + tools/list 的功能探测；探测完成后关闭会话。
- 进程内存是否随会话数持续增长。当前没有应用级会话 TTL，异常客户端未关闭会话时需要重点观察。

建议告警至少覆盖服务退出、连续重启、持续 5xx、内存持续上涨和证书即将过期。具体阈值应根据 dev 实际流量观察后确定，不在 MCP 中硬编码。

### 10.3 日志与数据保留

应用日志不应包含用户凭据。由 journald 和 Nginx 日志策略控制保留周期与磁盘上限。部署前确认主机已有 logrotate/journald 限额，避免日志占满磁盘。

应用无业务持久化数据，不需要数据库备份。需要纳入配置备份或配置管理的内容包括：

- `/etc/screen-mcp/screen-mcp.env`
- `/etc/systemd/system/screen-mcp.service`
- Nginx server 配置
- TLS/鉴权配置的引用关系，不在普通备份中明文扩散私钥和凭据
- 发布单中的 Git SHA 和 release 目录映射

## 11. 常见故障排查

| 现象 | 常见原因 | 检查和处理 |
| --- | --- | --- |
| systemd 启动后立即退出 | Node 路径错误、未构建、依赖缺失、端口占用 | 查看 `journalctl -u screen-mcp`；核对 `command -v node`、`dist/src/http-server.js`、`npm ci` 和 `ss -lntp` |
| 403 `Invalid Host` | Nginx 透传的域名不在 `MCP_ALLOWED_HOSTS` | 核对 `proxy_set_header Host $host` 和环境变量，主机名不要带协议或端口 |
| 400 `Missing mcp-session-id header` | GET/DELETE 没有会话头，或只是浅层探针 | 对裸 GET 属于预期；正常客户端应先 initialize 并保存响应会话 ID |
| 400 `Request must be an MCP initialize request` | 首次 POST 不是 initialize，或客户端协议不正确 | 检查客户端 transport 和初始化顺序 |
| 404 `Session not found` | 服务刚重启、会话落到另一实例、客户端使用了旧 ID | 让客户端重新 initialize；确认当前只有单实例且没有错误负载均衡 |
| 413 | MCP JSON 请求体超过 10 MB，或 Nginx 限制更小 | 检查 Nginx `client_max_body_size` 和请求规模；不要绕过应用 10 MB 限制 |
| 502/504 | Node 服务未监听、Nginx upstream 错误、流超时 | 检查 systemd、127.0.0.1:3460 和 `proxy_read_timeout`；确认未开启缓冲 |
| 浏览器预检失败 | 网关拦截 OPTIONS 或认证策略不兼容预检 | 确认 `/mcp` 允许 OPTIONS，核对网关 CORS 和认证策略 |
| 发布后仍是旧能力 | 软链接未切换或进程未重启 | 对比 `readlink`、`git rev-parse HEAD` 和 `get_server_diagnostics.source.entryFile/startedAt` |
| 内存持续增长 | 客户端未 DELETE 会话，当前没有会话 TTL | 识别异常客户端，安排重启释放会话，并评估后续增加会话过期机制 |

## 12. 扩容和容器化边界

仓库当前没有 Dockerfile、Compose、Kubernetes manifest 或 Helm chart，因此本文不把容器部署描述为现成功能。需要容器化时，应先在仓库内补齐镜像构建、非 root 用户、健康检查、信号处理和镜像验证，再编写对应部署流程。

当前 dev 发布保持单实例。未来需要高可用或横向扩容时，至少先解决以下问题：

- 会话共享，或按 `mcp-session-id` 做可靠的会话粘滞；首次 initialize 没有该头，也要保证后续请求回到创建会话的实例。
- 发布和重启期间的连接排空与客户端重连。
- 专用 readiness/liveness 路由。
- 服务端鉴权、限流、会话 TTL 和可观测指标。

在这些能力完成前，不要简单增加多个 Node 进程或 Nginx upstream 实例。

## 13. 发布完成清单

- [ ] 发布使用完整、不可变的 Git commit SHA。
- [ ] `npm ci` 和 `npm run check` 全部通过。
- [ ] `current` 指向新的 release 目录。
- [ ] systemd 使用构建后的 `dist/src/http-server.js`。
- [ ] Node.js 为 `20.19.0`，服务使用的绝对路径已确认。
- [ ] 3460 只监听 `127.0.0.1`。
- [ ] `MCP_ALLOWED_HOSTS` 包含实际域名且不含端口。
- [ ] Nginx 已关闭 MCP 响应缓冲并允许 POST/GET/DELETE/OPTIONS。
- [ ] TLS、网关鉴权或受控来源限制已生效，3460 未暴露公网。
- [ ] MCP initialize、tools/list、`get_server_diagnostics` 和关键编译流程通过。
- [ ] 已记录发布 SHA、release 目录、`rulesVersion`、验收人和回滚目录。
- [ ] 已通知使用方重启期间会话失效，需要重新 initialize。
