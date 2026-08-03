# Screen MCP Windows dev 服务器部署说明

部署方式：Node.js 运行构建产物，NSSM 托管为 Windows 服务，Windows 防火墙限制访问来源。

对内访问地址示例：`http://mcp-dev.internal:3460/mcp`。

## 1. 准备环境

在 Windows Server 安装：

- Node.js `24.14.1`
- Git
- NSSM，本文假设路径为 `C:\Tools\nssm\win64\nssm.exe`

使用管理员 PowerShell 检查：

```powershell
node --version
npm --version
git --version
Test-Path 'C:\Tools\nssm\win64\nssm.exe'
```

## 2. 拉取并构建

把 `$ReleaseRef` 替换为需要发布的完整 Git commit SHA：

```powershell
$RepositoryUrl = 'https://github.com/Jveen-D/screen-mcp.git'
$ReleaseRef = '0123456789abcdef0123456789abcdef01234567'
$ReleaseId = "$(Get-Date -Format yyyyMMddHHmmss)-$($ReleaseRef.Substring(0, 8))"
$ReleaseDir = "C:\screen-mcp\releases\$ReleaseId"

New-Item -ItemType Directory -Force -Path 'C:\screen-mcp\releases', 'C:\screen-mcp\logs'
git clone --no-checkout $RepositoryUrl $ReleaseDir
git -C $ReleaseDir checkout --detach $ReleaseRef
npm --prefix $ReleaseDir ci
npm --prefix $ReleaseDir run check
Test-Path "$ReleaseDir\dist\src\http-server.js"
npm --prefix $ReleaseDir prune --omit=dev
```

每条命令都必须成功。`npm run check` 或文件检查失败时停止部署。

创建指向本次版本的目录联接：

```powershell
New-Item -ItemType Junction -Path 'C:\screen-mcp\current' -Target $ReleaseDir
```

## 3. 注册 Windows 服务

首次部署执行：

```powershell
$Nssm = 'C:\Tools\nssm\win64\nssm.exe'
$Node = (Get-Command node).Source

& $Nssm install ScreenMcp $Node 'C:\screen-mcp\current\dist\src\http-server.js'
& $Nssm set ScreenMcp AppDirectory 'C:\screen-mcp\current'
& $Nssm set ScreenMcp AppEnvironmentExtra `
  'NODE_ENV=production' `
  'HOST=0.0.0.0' `
  'PORT=3460' `
  'MCP_ALLOWED_HOSTS=mcp-dev.internal,服务器IP,localhost,127.0.0.1'
& $Nssm set ScreenMcp AppExit Default Restart
& $Nssm set ScreenMcp AppRestartDelay 5000
& $Nssm set ScreenMcp AppStdout 'C:\screen-mcp\logs\stdout.log'
& $Nssm set ScreenMcp AppStderr 'C:\screen-mcp\logs\stderr.log'
& $Nssm set ScreenMcp AppRotateFiles 1
& $Nssm set ScreenMcp AppRotateBytes 10485760
& $Nssm set ScreenMcp Start SERVICE_AUTO_START
```

将 `mcp-dev.internal` 和 `服务器IP` 替换为客户端实际使用的域名和 IP。`MCP_ALLOWED_HOSTS` 不要填写协议或端口。

让服务使用权限较低的 LocalService 账户，并授予目录权限：

```powershell
& $Nssm set ScreenMcp ObjectName 'NT AUTHORITY\LocalService'
icacls 'C:\screen-mcp' /grant '*S-1-5-19:(OI)(CI)RX' /T
icacls 'C:\screen-mcp\logs' /grant '*S-1-5-19:(OI)(CI)M' /T
```

启动服务：

```powershell
& $Nssm start ScreenMcp
Get-Service ScreenMcp
```

状态应为 `Running`。

## 4. 配置 Windows 防火墙

将示例网段替换为允许访问 dev 服务的真实内网或 VPN 网段：

```powershell
New-NetFirewallRule `
  -DisplayName 'Screen MCP 3460' `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 3460 `
  -RemoteAddress '10.0.0.0/8' `
  -Profile Domain,Private
```

不要把 3460 对公网开放。应用没有内置鉴权；如果需要公网访问，必须通过公司 HTTPS 网关、VPN、mTLS 或其他认证措施访问。

## 5. 验证部署

在服务器执行：

```powershell
Get-Service ScreenMcp
Get-NetTCPConnection -LocalPort 3460 -State Listen
Get-Content 'C:\screen-mcp\logs\stdout.log' -Tail 30
Get-Content 'C:\screen-mcp\logs\stderr.log' -Tail 30
curl.exe -i -H 'Host: mcp-dev.internal' 'http://127.0.0.1:3460/mcp'
```

预期结果：

- 服务状态为 `Running`。
- 3460 正常监听。
- stdout 包含 `Streamable HTTP endpoint`。
- 最后一条命令返回 HTTP 400 和 `Missing mcp-session-id header`。这是无会话 GET 的正常响应，表示 MCP 路由可用。

最后使用 MCP 客户端连接：

```text
http://mcp-dev.internal:3460/mcp
```

确认能够列出工具并调用 `get_server_diagnostics`。

## 6. 更新版本

先按第 2 章创建并构建新的 `$ReleaseDir`，然后执行：

```powershell
$Nssm = 'C:\Tools\nssm\win64\nssm.exe'
$PreviousRelease = (Get-Item 'C:\screen-mcp\current').Target

& $Nssm stop ScreenMcp
Remove-Item -LiteralPath 'C:\screen-mcp\current'
New-Item -ItemType Junction -Path 'C:\screen-mcp\current' -Target $ReleaseDir
& $Nssm start ScreenMcp

Get-Service ScreenMcp
```

记录 `$PreviousRelease`，并重复第 5 章验证。服务重启后，客户端需要重新连接 MCP。

## 7. 回滚

把 `$RollbackDir` 设置为上一个可用版本：

```powershell
$Nssm = 'C:\Tools\nssm\win64\nssm.exe'
$RollbackDir = 'C:\screen-mcp\releases\上一版本目录'

Test-Path "$RollbackDir\dist\src\http-server.js"
& $Nssm stop ScreenMcp
Remove-Item -LiteralPath 'C:\screen-mcp\current'
New-Item -ItemType Junction -Path 'C:\screen-mcp\current' -Target $RollbackDir
& $Nssm start ScreenMcp

Get-Service ScreenMcp
```

回滚后重复第 5 章验证。

## 常用命令

```powershell
Start-Service ScreenMcp
Stop-Service ScreenMcp
Restart-Service ScreenMcp
Get-Service ScreenMcp
Get-Content 'C:\screen-mcp\logs\stderr.log' -Tail 100
```

当前 MCP 会话保存在单个 Node.js 进程内存中，dev 服务器只启动一个服务实例。
