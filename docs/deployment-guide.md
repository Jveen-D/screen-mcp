# Screen MCP dev 服务器部署说明

适用于 Linux、systemd、Nginx。服务以单实例运行，对外地址为 `https://mcp-dev.example.com/mcp`。

部署前准备：

- Node.js `24.14.1`、npm、Git、Nginx。
- 一个已通过测试的完整 Git commit SHA。
- dev 域名、TLS 证书和允许访问的内网/VPN 网段。
- 服务器仅开放 443，应用端口 3460 不对公网开放。

下面的 `mcp-dev.example.com`、证书路径、网段和 Git SHA 需要替换为实际值。

## 1. 创建运行用户

首次部署执行：

```bash
sudo useradd --system --create-home --home-dir /opt/screen-mcp --shell /usr/sbin/nologin screen-mcp
sudo install -d -o screen-mcp -g screen-mcp -m 0750 /opt/screen-mcp/releases
sudo install -d -o root -g screen-mcp -m 0750 /etc/screen-mcp

node --version
command -v node
```

Node.js 应显示 `v24.14.1`。下文假设 Node 路径为 `/usr/bin/node`，如果 `command -v node` 返回其他路径，需要修改 systemd 的 `ExecStart`。

## 2. 拉取并构建

将 `RELEASE_REF` 替换为本次发布的完整 commit SHA：

```bash
REPOSITORY_URL='https://github.com/Jveen-D/screen-mcp.git'
RELEASE_REF='0123456789abcdef0123456789abcdef01234567'
RELEASE_ID="$(date +%Y%m%d%H%M%S)-$(printf '%s' "$RELEASE_REF" | cut -c1-8)"
RELEASE_DIR="/opt/screen-mcp/releases/$RELEASE_ID"

sudo -u screen-mcp git clone --no-checkout "$REPOSITORY_URL" "$RELEASE_DIR"
sudo -u screen-mcp git -C "$RELEASE_DIR" checkout --detach "$RELEASE_REF"
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" ci
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" run check
test -f "$RELEASE_DIR/dist/src/http-server.js"
sudo -u screen-mcp npm --prefix "$RELEASE_DIR" prune --omit=dev
```

`npm run check` 失败时停止部署，不要切换版本。

## 3. 配置环境变量

创建 `/etc/screen-mcp/screen-mcp.env`：

```ini
NODE_ENV=production
HOST=127.0.0.1
PORT=3460
MCP_ALLOWED_HOSTS=mcp-dev.example.com,localhost,127.0.0.1
```

设置权限：

```bash
sudo chown root:screen-mcp /etc/screen-mcp/screen-mcp.env
sudo chmod 0640 /etc/screen-mcp/screen-mcp.env
```

`MCP_ALLOWED_HOSTS` 中填写域名，不要带协议和端口。

## 4. 配置并启动 systemd

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

[Install]
WantedBy=multi-user.target
```

切换到本次版本并启动：

```bash
sudo ln -sfnT "$RELEASE_DIR" /opt/screen-mcp/current
sudo systemctl daemon-reload
sudo systemctl enable --now screen-mcp
sudo systemctl status screen-mcp --no-pager
```

常用命令：

```bash
sudo systemctl restart screen-mcp
sudo systemctl stop screen-mcp
sudo systemctl start screen-mcp
journalctl -u screen-mcp -f
```

## 5. 配置 Nginx

创建 dev 域名的 Nginx 配置。`10.0.0.0/8` 必须替换为实际允许访问的网段：

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

检查并加载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

应用没有内置鉴权。如果该域名可以从公网访问，必须在公司网关增加 OAuth、mTLS 或其他认证方式。

## 6. 验证部署

检查服务和监听地址：

```bash
systemctl is-active screen-mcp
sudo ss -lntp | grep ':3460'
journalctl -u screen-mcp -n 50 --no-pager
```

3460 应只监听 `127.0.0.1`。

检查 MCP 初始化：

```bash
curl --include --request POST 'https://mcp-dev.example.com/mcp' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"deploy-check","version":"1.0.0"}}}'
```

部署成功时应返回：

- HTTP 200。
- 响应头包含 `mcp-session-id`。
- 响应体包含 `"name":"screen-component-mcp"`。

## 7. 更新版本

重复第 2 章构建新 release，然后执行：

```bash
PREVIOUS_RELEASE="$(readlink -f /opt/screen-mcp/current)"
sudo ln -sfnT "$RELEASE_DIR" /opt/screen-mcp/current
sudo systemctl restart screen-mcp
sudo systemctl status screen-mcp --no-pager
```

记录 `PREVIOUS_RELEASE`，并重复第 6 章验证。重启后旧 MCP 会话失效，客户端需要重新连接。

## 8. 回滚

将 `ROLLBACK_DIR` 设置为上一个可用 release：

```bash
ROLLBACK_DIR='/opt/screen-mcp/releases/上一版本目录'
test -f "$ROLLBACK_DIR/dist/src/http-server.js"
sudo ln -sfnT "$ROLLBACK_DIR" /opt/screen-mcp/current
sudo systemctl restart screen-mcp
sudo systemctl status screen-mcp --no-pager
```

回滚后重复第 6 章验证。

## 注意事项

- 服务器必须运行 `dist/src/http-server.js`，不要使用 `npm run dev:http`。
- 当前会话保存在进程内存中，只部署一个实例。
- 应用没有 `/health` 接口；不要使用 `/mcp` 的 2xx 结果作为普通健康检查。
- 不要将 3460 直接暴露到公网。
