# Screen Component MCP

独立的 Node.js + TypeScript MCP Server，用来给大屏设计 AI 提供组件能力地图，并把 AI 生成的最小 props 转换成编辑器可直接使用的完整组件 schema。

当前内置组件：

- `PieChart`
- `SingleImage`
- `SingleText`
- `SvgDecoration`

当前内置模块：

- `ChartPanel`

## 安装依赖

要求 Node.js `>=18`。

```bash
npm install
```

## 启动 MCP Server

开发模式：

```bash
npm run dev
```

构建后启动：

```bash
npm run build
npm start
```

Server 使用官方 `@modelcontextprotocol/sdk`，默认通过 stdio transport 工作。

## 启动 HTTP MCP Server

开发模式：

```bash
npm run dev:http
```

默认运行在 `http://localhost:3460`，SSE 端点为 `http://localhost:3460/sse`。

Agent 配置示例：

```json
{
  "mcpServers": {
    "screen-mcp": {
      "name": "screen-component-mcp",
      "transport": "sse",
      "url": "http://localhost:3460/sse"
    }
  }
}
```

## 本地 AI 代理（浏览器开发用）

`ai-proxy/` 提供了一个轻量本地代理，用于解决浏览器直接调用 Kimi Code API 等远程服务时的 CORS 限制。

启动代理：

```bash
node ai-proxy/local-server.js
```

默认监听 `http://localhost:3456`。

前端 Base URL 填写：

```text
http://localhost:3456/v1/messages?target=<目标 baseURL 的 URL 编码>
```

Kimi Code API 示例：

```text
http://localhost:3456/v1/messages?target=https%3A%2F%2Fapi.kimi.com%2Fcoding%2Fv1
```

代理会把请求转发到 `target` 指定的后端，并在响应中附加 CORS 头，允许前端跨域访问。

目录结构：

- `ai-proxy/local-server.js`：本地 Node.js 代理，开发时最常用
- `ai-proxy/cloudflare-worker.js`：Cloudflare Worker 版本，可部署到边缘节点
- `ai-proxy/vercel-edge-function.ts`：Vercel Edge Function 版本
- `ai-proxy/test-kimi.js`：快速验证 Kimi Code API 连通性

## 用 MCP Inspector 测试

```bash
npx @modelcontextprotocol/inspector npm run dev
```

在 Inspector 中可依次调用：

1. `list_components`
2. `get_component_capability`，输入 `{ "componentName": "PieChart" }`
3. `generate_components_schema`，输入 capability 示例里的 `props`

AI 应该按 `list_components -> get_component_capability -> generate_components_schema` 的顺序使用。先发现组件，再读取组件能力与约束，最后只提交 AI 可写的最小 props 给 MCP 生成完整 schema。

如果要生成一个完整面板模块，AI 应该按以下顺序使用：

1. `list_modules`
2. `get_module_capability`，输入 `{ "moduleName": "ChartPanel" }`
3. `generate_module_schema`，输入模块级 props

`ChartPanel` 会按 slot 编排 `SingleImage` 背景、`SingleText` 标题、主图表和 `SvgDecoration` 装饰，最终返回完整组件 schema 数组。

## 验证流程

```bash
npm run test:flow
```

测试会验证：

- `list_components` 能返回 `PieChart`
- `list_modules` 能返回 `ChartPanel`
- `get_component_capability("PieChart")` 能返回 `requiredProps`、`aiWritableProps`、`aiForbiddenProps`、`examples`
- `get_module_capability("ChartPanel")` 能返回模块 slots 和布局规则
- 使用 capability 示例 props 生成完整 schema
- 使用 `generate_module_schema` 生成完整图表面板 schema 数组
- `chartData.sourceType` 仍然是 `constant`
- `option.series[0].type` 仍然是 `pie`
- `option.series[0].radius` 使用 AI 输入
- `businessElementId` 和 `parentBusinessElementId` 使用 AI 输入 ID

## 设计约束

- 不依赖前端仓库路径
- 不读取 `meta.ts`
- 所有 capability/defaultProps 都以内置纯对象维护
- `chartData` 不暴露给 AI 生成，schema 生成时永远恢复为默认值
- 未知组件会返回清晰错误，例如 `unknown componentName: Xxx`
