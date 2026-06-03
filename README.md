# Screen Component MCP

独立的 Node.js + TypeScript MCP Server，用来给大屏设计 AI 提供组件能力地图，并把 AI 生成的最小 props 转换成编辑器可直接使用的完整组件 schema。

当前内置组件：

- `PieChart`
- `SingleImage`
- `SingleText`
- `SvgDecoration`

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

## 用 MCP Inspector 测试

```bash
npx @modelcontextprotocol/inspector npm run dev
```

在 Inspector 中可依次调用：

1. `list_components`
2. `get_component_capability`，输入 `{ "componentName": "PieChart" }`
3. `generate_components_schema`，输入 capability 示例里的 `props`

AI 应该按 `list_components -> get_component_capability -> generate_components_schema` 的顺序使用。先发现组件，再读取组件能力与约束，最后只提交 AI 可写的最小 props 给 MCP 生成完整 schema。

## 验证流程

```bash
npm run test:flow
```

测试会验证：

- `list_components` 能返回 `PieChart`
- `get_component_capability("PieChart")` 能返回 `requiredProps`、`aiWritableProps`、`aiForbiddenProps`、`examples`
- 使用 capability 示例 props 生成完整 schema
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
