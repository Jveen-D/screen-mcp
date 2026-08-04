# Docker 部署

镜像启动的是 Streamable HTTP MCP 服务，端点为 `/mcp`。需要 Docker 运行 Linux 容器。

## 构建镜像

在项目根目录执行：

```bash
docker build -t screen-component-mcp:0.1.0 .
```

构建阶段会执行 TypeScript 编译。推送到后端镜像仓库：

```bash
docker tag screen-component-mcp:0.1.0 registry.example.com/screen-component-mcp:0.1.0
docker push registry.example.com/screen-component-mcp:0.1.0
```

将仓库地址和版本替换为实际值；推送前先完成 `docker login`。

本机没有 Docker 时，也可以从 GitHub Actions 下载镜像文件：

1. 推送代码并等待 `CI` 工作流完成。
2. 打开仓库的 `Actions`，进入对应运行记录。
3. 在页面底部的 `Artifacts` 下载 `screen-component-mcp-<commit SHA>`。
4. 解压下载的 ZIP，得到 `screen-component-mcp-<commit SHA>.tar.gz`。
5. 将文件传到服务器并导入：

```bash
IMAGE_SHA='填写完整commit SHA'
docker load --input "screen-component-mcp-${IMAGE_SHA}.tar.gz"
docker image ls screen-component-mcp
```

Artifact 保留 7 天。导入后的镜像 tag 是完整 commit SHA。

## 启动容器

`MCP_ALLOWED_HOSTS` 填写客户端访问时使用的域名或 IP，不要带协议和端口：

```bash
docker run -d \
  --name screen-mcp \
  --restart unless-stopped \
  -p 3460:3460 \
  -e HOST=0.0.0.0 \
  -e PORT=3460 \
  -e MCP_ALLOWED_HOSTS=mcp-dev.internal,127.0.0.1,localhost \
  screen-component-mcp:0.1.0
```

只允许内网或网关访问 3460，不要直接暴露到公网。需要 HTTPS 和鉴权时，在容器前配置公司网关或反向代理。

## 验证

```bash
docker ps
docker inspect --format '{{.State.Health.Status}}' screen-mcp
docker logs --tail 50 screen-mcp
curl --include --header 'Host: mcp-dev.internal' http://127.0.0.1:3460/mcp
```

容器健康状态应为 `healthy`。裸 GET 返回 400 和 `Missing mcp-session-id header` 是正常的路由探针结果；再使用 MCP 客户端连接：

```text
http://mcp-dev.internal:3460/mcp
```

## 更新和回滚

使用不可变镜像 tag 部署。更新时拉取新 tag、停止旧容器并以相同环境变量启动：

```bash
docker pull registry.example.com/screen-component-mcp:0.1.1
docker stop screen-mcp
docker rm screen-mcp
docker run -d \
  --name screen-mcp \
  --restart unless-stopped \
  -p 3460:3460 \
  -e HOST=0.0.0.0 \
  -e PORT=3460 \
  -e MCP_ALLOWED_HOSTS=mcp-dev.internal,127.0.0.1,localhost \
  registry.example.com/screen-component-mcp:0.1.1
```

回滚时将镜像 tag 改回上一个已验证版本。容器重启会使内存中的 MCP 会话失效，客户端需要重新连接。
