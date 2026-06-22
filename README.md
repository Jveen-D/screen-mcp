# Screen Component MCP

独立的 Node.js + TypeScript MCP Server，用来给大屏设计 AI 提供组件能力地图，并把 AI 设计出的结构化 props / DashboardSpec 转换成编辑器可直接使用的完整 schema。

核心原则：LLM 负责设计决策，MCP 负责能力说明、校验、默认组件 props 合并和 schema 编译。整屏大屏不再由 MCP 根据 prompt 套固定模板生成。

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
或者
```json
{
  "mcpServers": {
    "screen-mcp": {
      "command": "node",
      "args": [
        "C:\\github\\screen-mcp\\dist\\src\\server.js"
      ]
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

生成单个组件时可依次调用：

1. `list_components`
2. `get_component_capability`，输入 `{ "componentName": "PieChart" }`
3. `generate_components_schema`，输入 capability 示例里的 `props`

AI 应该按 `list_components -> get_component_capability -> generate_components_schema` 的顺序使用。先发现组件，再读取组件能力与约束，最后只提交 AI 可写的最小 props 给 MCP 生成完整 schema。

生成一个完整面板模块时，AI 应该按以下顺序使用：

1. `list_modules`
2. `get_module_capability`，输入 `{ "moduleName": "ChartPanel" }`
3. `generate_module_schema` 或 `generate_module_tree_schema`，输入模块级 props

`ChartPanel` 默认是 manual 编译模式：只编排 LLM 显式提供的 slots。背景、标题承托、面板边框、侧边容器、底部结构线等装饰应由 LLM 放入 `slots.background` / `slots.decorations`，MCP 不再自动套固定装饰模板。`layoutMode: "assisted"` 仅用于旧 demo 或单模块 prompt 流程，保留中心摘要、侧边摘要文本和色标等辅助生成能力。

生成整屏大屏时，推荐使用 DashboardSpec：

1. LLM 根据用户描述自主决定主题颜色、模块列表、图表类型、布局坐标、文案、背景和装饰语言。
2. LLM 组装完整 `DashboardSpec`。
3. 可选调用 `validate_dashboard_spec` 检查缺字段、越界、重叠等问题。
4. 调用 `generate_dashboard_schema` 编译成一个编辑器可用的 `__Group__` 树。

简化示例：

```json
{
  "logicalId": "ops_dashboard",
  "title": "运营洞察大屏",
  "canvas": { "width": 1920, "height": 1080 },
  "theme": {
    "primaryColor": "#28E0B9",
    "secondaryColor": "#2F80ED",
    "accentColor": "#FFB020",
    "textColor": "#EFFFFA"
  },
  "components": [
    {
      "componentName": "SingleText",
      "logicalId": "dashboard_title",
      "textContent": "运营洞察大屏",
      "style": { "position": "absolute", "left": 48, "top": 28, "width": 520, "height": 36 }
    }
  ],
  "modules": [
    {
      "moduleName": "ChartPanel",
      "logicalId": "risk_panel",
      "title": "风险等级分析",
      "style": { "position": "absolute", "left": 48, "top": 120, "width": 520, "height": 360 },
      "slots": {
        "mainChart": {
          "componentName": "PieChart",
          "props": {
            "chartData": {
              "constant": {
                "data": [
                  { "name": "高风险", "type": "风险", "value": 18 },
                  { "name": "中风险", "type": "风险", "value": 37 },
                  { "name": "低风险", "type": "风险", "value": 71 }
                ]
              }
            }
          }
        }
      }
    }
  ]
}
```

`generate_full_screen_from_prompt` 已禁用生产生成用途，因为 prompt-only 整屏生成容易回到固定模板复用。需要整屏时请先由 LLM 生成 DashboardSpec，再调用 `generate_dashboard_schema`。

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
- 使用 `validate_dashboard_spec` / `generate_dashboard_schema` 走通整屏编译流程
- `generate_full_screen_from_prompt` 保持禁用，避免 prompt-only 固定模板生成
- `chartData.sourceType` 仍然是 `constant`
- `option.series[0].type` 仍然是 `pie`
- `option.series[0].radius` 使用 AI 输入
- `businessElementId` 和 `parentBusinessElementId` 使用 AI 输入 ID

## 设计约束

- 不依赖前端仓库路径
- 不读取 `meta.ts`
- 所有 capability/defaultProps 都以内置纯对象维护
- `chartData` 不暴露给 AI 生成，schema 生成时永远恢复为默认值
- 整屏生成由 LLM 设计 DashboardSpec，MCP 不沉淀整屏模板
- `SingleImage` 背景节点必须排在 siblings 最后，避免遮挡内容
- 未知组件会返回清晰错误，例如 `unknown componentName: Xxx`
