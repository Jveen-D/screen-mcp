# Screen Component MCP

独立的 Node.js + TypeScript MCP Server，用来给大屏设计 AI 提供组件能力地图，并把 AI 设计出的结构化 props / DashboardSpec 转换成编辑器可直接使用的完整 schema。

核心原则：LLM 负责设计决策，MCP 负责能力说明、校验、默认组件 props 合并和 schema 编译。整屏大屏不再由 MCP 根据 prompt 套固定模板生成。

## 项目意图

`screen-component-mcp` 的定位是大屏编辑器 schema 的能力编译器，而不是大屏模板生成器。它要解决的问题是：大屏编辑器 schema 结构复杂，LLM 直接输出完整 schema 容易遗漏字段、层级错误或覆盖默认配置；但如果 MCP 根据 prompt 固定套模板，又会限制 LLM 的设计自由。

因此项目采用清晰的职责拆分：

- LLM 负责完整设计：主题、颜色、模块列表、布局坐标、图表类型、文案、背景、装饰和组件组合。
- MCP 负责工程化编译：暴露组件/模块能力，校验 `DashboardSpec`，合并默认 props，规范 ID、父子关系和层级顺序，输出编辑器可直接使用的完整 schema。
- 生产整屏流程以 `DashboardSpec` 为中心：LLM 先设计完整 spec，可选调用 `validate_dashboard_spec` 检查结构，再调用 `generate_dashboard_schema` 编译。
- 项目不沉淀行业模板、主题模板、布局模板或关键词到模板的映射；新增能力应优先增强能力说明、校验、规范化、编译和测试。

<!-- BEGIN AUTO GENERATED CAPABILITIES -->

此区块由 `npm run docs:generate` 生成，请不要手写维护。

当前 MCP 工具：19 个。
当前内置组件：53 个。
当前内置模块：3 个。

- [工具参考](docs/tool-reference.md)
- [组件参考](docs/component-reference.md)
- [模块参考](docs/module-reference.md)
- [BlackHole SDK 参考](docs/blackhole-sdk-reference.md)
- [开发规范](docs/development-rules.md)

<!-- END AUTO GENERATED CAPABILITIES -->

## 安装依赖

要求 Node.js `24.14.1`。

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

默认运行在 `http://localhost:3460`，Streamable HTTP 端点为 `http://localhost:3460/mcp`。

部署到容器或跨主机反向代理时，设置 `HOST=0.0.0.0`；Nginx 与 MCP 同机部署时优先保留 `HOST=127.0.0.1`。通过逗号分隔的 `MCP_ALLOWED_HOSTS` 配置允许访问的域名（不含端口），例如 `MCP_ALLOWED_HOSTS=platform.example.com`。生产环境应由网关提供 HTTPS、身份认证和访问控制，不要直接将未鉴权的 MCP 端口暴露到公网。

Windows dev 服务器部署步骤见 [Windows dev 服务器部署说明](docs/deployment-guide.md)。

Docker 镜像构建、启动、推送和回滚见 [Docker 部署说明](docs/docker-deployment.md)。

Agent 配置示例：

```json
{
  "mcpServers": {
    "screen-mcp": {
      "name": "screen-component-mcp",
      "transport": "streamable-http",
      "url": "http://localhost:3460/mcp"
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

## BlackHole Engine WebSDK 代码生成

项目使用 [`docs/BlackHole Engine API_Web-v3.2.0.3808.docx`](docs/BlackHole%20Engine%20API_Web-v3.2.0.3808.docx) 作为 BlackHole Engine WebSDK 的唯一真相源。`npm run blackhole:generate` 会机械提取版本、模块、API、参数、嵌套模型、调用说明和示例，生成运行时 catalog；`npm run check:blackhole` 用源文件 SHA-256 检查派生产物是否同步。

这里继续遵循同一职责边界：LLM 负责理解用户描述、选择 SDK API 并设计 `BlackHoleScriptSpec`，MCP 负责能力检索、API 消歧、结构校验和确定性 JavaScript 编译。MCP 不直接把自然语言套成固定代码模板，也不猜测资源 URL、账号、组件 ID、数据集 ID 或构件 ID。

推荐调用顺序：

1. `list_blackhole_sdk_modules`
2. `search_blackhole_sdk`
3. `get_blackhole_api_capability`
4. `validate_blackhole_script_spec`
5. `generate_blackhole_code`

宿主集成的端到端工作流：

1. 前端冻结当前选中组件，并提供变量、方法、数据源、节点能力和脱敏后的 `componentDidMount` 方法体。
2. LLM 先判断需求是已完整实现、已有托管块部分实现，还是需要新增；同时按真实触发源选择生命周期、SDK 事件、组件事件或手动方法。
3. LLM 按上述工具顺序检索并读取 SDK 真相，设计完整 `BlackHoleScriptSpec`。MCP 不根据提示词硬编码 API 选择。
4. MCP 校验 SDK 参数、构件效果语义、生命周期位置、安全输入映射和中文注释，并确定性编译 JavaScript 与 `hostPatch`。
5. 相同可执行语义生成稳定 `integrationId`。只有宿主已核验的 Screen MCP 托管块允许通过 `hostIntegration.replaceIntegrationId` 更新；普通手写代码或无效 marker 不允许替换。
6. 前端再次校验选中节点、组件事件、旧 marker 和重复事件监听，生成写入差异预览后，事务写入 methods、变量和组件绑定；失败时不保留部分变更。

生命周期约束：页面自动执行逻辑写入 `componentDidMount`，但挂载不代表三维场景或模型已经 ready。依赖 SDK/模型就绪的逻辑必须在这里注册文档确认的 SDK 事件，并把操作放入对应事件处理器。监听函数是方法内局部变量，不写入 `ctx`；当前契约不自动生成监听销毁代码。只有 `cleanup` 显式声明的 SDK 清理操作才写入 `componentWillUnMount`。

简化结构示例：

```json
{
  "sdkVersion": "3.2.0.3808",
  "functionName": "setupModelScene",
  "inputs": [
    { "name": "dataSetList", "description": "用户明确提供的模型数据集" }
  ],
  "operations": [
    {
      "api": "Model.loadDataSet",
      "args": [{ "$input": "dataSetList" }]
    }
  ]
}
```

未提供 `hostIntegration` 时，生成结果是一个接收“已就绪 BlackHole3D 兼容实例”和显式 `inputs` 的独立 JavaScript setup 函数。提供 `hostIntegration` 时，结果还包含结构化 `hostPatch`：生命周期代码在 SDK 实际调用时读取 `window.BlackHole3D`，变量和组件绑定由宿主负责预览与事务写入。两种结果都只作为文本和结构化数据返回，MCP 不执行生成代码，也不直接修改大屏项目。

完整版本、模块清单和结构化值写法见 [BlackHole SDK 参考](docs/blackhole-sdk-reference.md)。

## 用 MCP Inspector 测试

```bash
npx @modelcontextprotocol/inspector npm run dev
```

生成单个组件时可依次调用：

1. `list_components`
2. `get_component_capability`，输入 `{ "componentName": "PieChart" }`，默认返回 compact 能力
3. `generate_components_schema`，输入 LLM 自己设计的最小 props

AI 应该按 `list_components -> get_component_capability -> generate_components_schema` 的顺序使用。先发现组件，再读取组件能力与约束，最后只提交 AI 可写的最小 props 给 MCP 生成完整 schema。为提升速度，`get_component_capability` 默认省略 `examples`、长规则和完整视觉说明；只有调试组件能力或确实需要示例时才传 `{ "detail": "full" }`。修改已导出的节点数据时，读取同一 capability 的 `runtimeDataBinding`：`sourceTypeSemantics`、`staticDataContract`、`apiContract`、`pollingContract`、组件专属 `fieldMappingKeys` 和 `rules` 给出完整运行时约束；它们只描述运行时编辑，不能替代生成工具输入。

生成一个完整面板模块时，AI 应该按以下顺序使用：

1. `list_modules`
2. `get_module_capability`，输入 `list_modules` 返回的模块名，默认返回 compact 能力
3. `generate_module_schema` 或 `generate_module_tree_schema`，输入模块级 props

`get_module_capability` 默认只返回 slots、必要 props、分组能力和规则分组摘要，不返回完整 `layoutRules` 与示例。需要完整规则文本时显式传 `{ "detail": "full" }`。

模块选择原则：

- `ChartPanel` 是图表分析面板模块，主内容由 `slots.mainChart` 承载，适合饼图、柱状图、折线图、玫瑰图、散点图等图表分析面板。
- `FreeformModule` 是自由模块，不生成固定布局和默认装饰，只把 LLM 在 `slots.children` 中明确提供的任意组件编译成模块树，适合 KPI、表格、地图、媒体、控制器和混合信息卡。
- `LayoutPlaceholder` 只服务于从零搭建流程中用户确认内容布局之前的临时占位。调用方决定真实标题、表现形式、内容摘要和区域，MCP 生成编辑器可用的边框、标题和说明节点；确认后必须删除，不得作为生产 DashboardSpec 模块。

`ChartPanel` 默认是 manual 编译模式：只编排 LLM 显式提供的 slots。背景、标题承托、面板边框、侧边容器、底部结构线等装饰应由 LLM 放入 `slots.background` / `slots.decorations`，关键洞察、中心指标、侧边摘要或底部结论应由 LLM 放入 `slots.auxiliaryTexts`。MCP 不再自动套固定装饰模板，也不会在 manual 模式下自动补业务辅助文案；常规主图缺少 `slots.auxiliaryTexts` 的 manual `ChartPanel` 会被拒绝。RingChart 例外：默认只使用图表内部的 `option.title` 与 `series.label/labelLine`，不要求也不自动生成外置 `SingleText`；只有用户明确要求独立排版时才传入 `slots.auxiliaryTexts`。`layoutMode: "assisted"` 仅用于旧 demo 或单模块 prompt 流程；其他图表仍可保留辅助摘要生成，RingChart 的总数写入内部 `option.title`。

`ChartPanel` 和 `FreeformModule` 支持通用语义分组：

```json
{
  "grouping": {
    "mode": "semantic",
    "singleChildGroup": true
  }
}
```

`mode: "semantic"` 会按标题、辅助文本、中心摘要、结论、重点摘要、装饰、主内容、背景分组；`singleChildGroup: true` 表示即使某个语义分组里只有一个组件，也会包成 `__Group__`。如果在 DashboardSpec 顶层设置 `grouping`，`ChartPanel` 和 `FreeformModule` 会继承该策略。`LayoutPlaceholder` 的三节点结构和顺序固定，不接受语义分组配置。

层级顺序遵循编辑器渲染规则：同级数组越靠前越在顶层。语义分组会让主内容组排在装饰组和背景组之前，背景组始终最后，避免装饰或背景遮挡主图表、指标、表格等业务内容。`imageSrc` 只应在用户明确提供素材路径时使用；LLM 不应猜测或选择项目现有素材，现有素材主要用于大屏生成后由用户替换元素。

生成整屏大屏时，推荐使用 DashboardSpec：

1. LLM 根据用户描述自主决定主题颜色、模块列表、图表类型、布局坐标、文案、背景和装饰语言。
2. LLM 组装完整 `DashboardSpec`。
3. 可选调用 `validate_dashboard_spec` 检查缺字段、越界、重叠等问题。
4. 调用 `generate_dashboard_schema` 编译成一个编辑器可用的 `__Group__` 树。

DashboardSpec 支持三类顶层内容：

- `components`：少量全局组件，例如全屏标题、全屏背景、时间天气等。设置顶层 `grouping` 时，这些组件会按语义分组，背景组保持最后。
- `groups`：LLM 明确声明的一组相关组件，适合顶部信息组、KPI 组、自定义混合面板等不适合 ChartPanel 的区域。每个显式 `groups` 项必须声明完整的绝对区域 `style.left/top/width/height`，不能只作为无定位的组件桶。组内可使用 `components` 或 `children`，MCP 只按声明编译，不根据坐标或关键词猜测归属。
- `modules`：生产大屏结构化模块。图表分析面板用 `ChartPanel`，KPI、表格、地图、媒体、控制器和混合信息卡优先用 `FreeformModule`；临时的 `LayoutPlaceholder` 不得写入生产 DashboardSpec。

如果用户明确要求生成 BIM/模型场景，LLM 可以在 DashboardSpec 中额外声明 `reservedAreas`，例如设置 `purpose` / `type` / `kind` 为 `bim-model` 并提供完整的绝对 `style.left/top/width/height`。这只是编译期约束，用来提示中心模型展示区不能被顶层组件、分组或模块占用；`generate_dashboard_schema` 不会把 reserved area 输出为组件、分组或可见占位，也不会生成模型本身。存在显式 BIM 模型预留区时，MCP 不再补全屏背景，但仍会为缺少背景承载的显式分组和模块补轻量背景。

当一个大屏包含多个相关元素时，不要把所有元素都平铺到 `components`。应优先使用 `modules` 或显式 `groups`，这样编辑器树会按区域形成 `__Group__`，并且每个组内的背景组件会被放到背景组/底层，避免遮挡文字、图表和指标。

`__Group__` 只负责编辑器层级分组，不承担视觉背景。全屏底色、模块底板、面板边框都必须由真实组件表达，例如 `SvgDecoration` 或 `SingleImage`。如果 DashboardSpec 没有提供覆盖全屏的背景组件，或某个显式分组/模块没有背景承载，`generate_dashboard_schema` 会补同主题的轻量 `SvgDecoration` 背景组件；已有显式背景、底板或边框不会被替换。

DashboardSpec 的 `theme` 是编译期设计上下文，用于让 LLM 传入本屏的色板、背景色、主色、图表色等，MCP 在补齐轻量默认色、图表配置和背景承载时会读取它。最终编辑器 schema 不应在每个组件 `props` 里反复保留同一份 `theme`，编译输出会剥离该字段。

`SvgDecoration` 不能作为空占位。需要装饰时，LLM 必须提供非空 `svgContent`，或显式选择非空 `svgPreset`；否则 `validate_dashboard_spec` / `generate_dashboard_schema` 会拒绝该 DashboardSpec，避免出现不可见装饰或默认图标回退。

DashboardSpec 也会拒绝明显的占位内容：`SingleText` 必须提供真实 `textContent`，不能依赖“辅助信息”“单行文本”等默认文案；图表组件必须提供真实 `chartData.constant.data`，或在支持的 `ChartPanel` 中提供 `dataItems`，不能落回 `类目1/系列` 这类演示数据。直接调用 `generate_components_schema(s)` 生成图表组件时同样不能省略真实数据，否则会被拒绝，避免底层组件入口静默输出默认演示数据。

简化示例：

```json
{
  "logicalId": "ops_dashboard",
  "title": "运营洞察大屏",
  "canvas": { "width": 1920, "height": 1080 },
  "grouping": {
    "mode": "semantic",
    "singleChildGroup": true
  },
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
  "groups": [
    {
      "logicalId": "header_group",
      "title": "顶部信息组",
      "style": { "position": "absolute", "left": 0, "top": 0, "width": 1920, "height": 96 },
      "components": [
        {
          "componentName": "SvgDecoration",
          "logicalId": "header_line",
          "name": "顶部结构线",
          "svgSource": "custom",
          "svgContent": "<svg viewBox=\"0 0 1920 96\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M48 80H1872\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",
          "style": { "position": "absolute", "left": 0, "top": 0, "width": 1920, "height": 96 }
        },
        {
          "componentName": "SingleImage",
          "logicalId": "header_background",
          "name": "顶部背景",
          "imageBase64": "data:image/png;base64,...",
          "style": { "position": "absolute", "left": 0, "top": 0, "width": 1920, "height": 96 }
        }
      ]
    }
  ],
  "modules": [
    {
      "moduleName": "ChartPanel",
      "logicalId": "status_panel",
      "title": "状态分布分析",
      "style": { "position": "absolute", "left": 48, "top": 120, "width": 520, "height": 360 },
      "slots": {
        "mainChart": {
          "componentName": "PieChart",
          "props": {
            "chartData": {
              "constant": {
                "data": [
                  { "name": "状态A", "type": "状态", "value": 18 },
                  { "name": "状态B", "type": "状态", "value": 37 },
                  { "name": "状态C", "type": "状态", "value": 71 }
                ]
              }
            }
          }
        }
      }
    },
    {
      "moduleName": "FreeformModule",
      "logicalId": "kpi_panel",
      "title": "核心指标",
      "style": { "position": "absolute", "left": 600, "top": 120, "width": 360, "height": 180 },
      "slots": {
        "children": [
          {
            "componentName": "SingleText",
            "logicalId": "kpi_title",
            "name": "模块标题",
            "textContent": "核心指标",
            "style": { "position": "absolute", "left": 620, "top": 138, "width": 160, "height": 22, "fontSize": 22, "lineHeight": 1 }
          },
          {
            "componentName": "Indicator",
            "logicalId": "metric_indicator",
            "name": "指标值",
            "textValue": 128760,
            "titleName": "指标值",
            "suffix": true,
            "suffixTitle": "元",
            "style": { "position": "absolute", "left": 620, "top": 170, "width": 300, "height": 92 }
          }
        ]
      }
    }
  ]
}
```

## 母版与多页面项目

单个页面仍使用 `DashboardSpec -> generate_dashboard_schema`。当一次设计需要生成多个页面并共享母版时，使用 `DashboardProjectSpec`：

1. LLM 在 `masters` 中设计可复用的母版内容，每个母版都是完整的 DashboardSpec 内容区域。
2. LLM 在 `pages` 中设计普通页面，并通过 `masterLogicalIds` 引用一个或多个母版的 `logicalId`。
3. 可选调用 `validate_dashboard_project_spec` 检查重复文档 ID、悬空/重复母版引用和各页面内部的 DashboardSpec。
4. 调用 `generate_dashboard_project_schema` 编译完整项目 schema。结果包含 `documents`，可由编辑器作为项目直接导入。

项目级 `canvas`、`theme` 和 `grouping` 会被未单独声明这些字段的母版或页面继承。MCP 只执行继承、校验和 schema 编译，不决定母版应包含什么视觉内容。

```json
{
  "logicalId": "operations_project",
  "title": "运营多页面大屏",
  "canvas": { "width": 1920, "height": 1080 },
  "theme": {
    "background": "#071522",
    "primaryColor": "#23D5E8",
    "textColor": "#EAFBFF"
  },
  "masters": [
    {
      "logicalId": "shared_chrome",
      "title": "共用头部母版",
      "components": [
        {
          "componentName": "SingleText",
          "logicalId": "shared_title",
          "textContent": "运营指挥中心",
          "style": {
            "position": "absolute",
            "left": 48,
            "top": 24,
            "width": 420,
            "height": 32,
            "fontSize": 32,
            "lineHeight": 1
          }
        }
      ]
    }
  ],
  "pages": [
    {
      "logicalId": "overview_page",
      "title": "运营总览",
      "masterLogicalIds": ["shared_chrome"],
      "components": [
        {
          "componentName": "SingleText",
          "logicalId": "overview_metric",
          "textContent": "今日处理 128 项",
          "style": {
            "position": "absolute",
            "left": 48,
            "top": 128,
            "width": 260,
            "height": 24,
            "fontSize": 24,
            "lineHeight": 1
          }
        }
      ]
    },
    {
      "logicalId": "detail_page",
      "title": "运营明细",
      "masterLogicalIds": ["shared_chrome"]
    }
  ]
}
```

编译结果遵循编辑器的母版协议：

- 每个 `masters` 项编译为独立的 `pageType: "master"` document。
- 每个 `pages` 项编译为 `pageType: "page"` document。
- `masterLogicalIds` 编译为普通页根节点下的 `Master` 引用节点，其 ID 精确等于对应母版 document ID。
- 普通页面排在 `documents` 前部，避免编辑器默认打开母版。
- 页面可以只引用母版而没有自己的组件；母版不能再引用其他母版。
- 页面自身内容排在 `Master` 引用之前，确保页面内容渲染在母版内容上方。
- 母版和已引用母版的页面不会自动补全屏背景，避免多层母版互相遮挡；需要背景时由 LLM 显式设计真实背景组件。

`generate_full_screen_from_prompt` 已禁用生产生成用途，因为 prompt-only 整屏生成容易回到固定模板复用。需要整屏时请先由 LLM 生成 DashboardSpec，再调用 `generate_dashboard_schema`。

## 验证流程

```bash
npm run test:flow
```

完整检查：

```bash
npm run check
```

测试会验证：

- `list_components` 能返回 `PieChart`
- `list_modules` 能返回 `ChartPanel`、`FreeformModule` 和 `LayoutPlaceholder`
- `get_component_capability("PieChart")` 能返回 `requiredProps`、`aiWritableProps`、`aiForbiddenProps`、`runtimeDataBinding`、`examples`
- `get_module_capability("ChartPanel")` 能返回模块 slots 和布局规则
- `get_module_capability("FreeformModule")` 能返回自由模块 slots 和分组规则
- `get_module_capability("LayoutPlaceholder")` 能返回临时占位的固定结构、输入和删除约束
- 使用 capability 示例 props 生成完整 schema
- 使用 `generate_module_schema` 生成完整图表面板、自由模块和布局确认占位 schema 数组
- 使用 `grouping.singleChildGroup` 生成单组件语义分组
- 使用 `validate_dashboard_spec` / `generate_dashboard_schema` 走通整屏编译流程
- 使用 `validate_dashboard_project_spec` / `generate_dashboard_project_schema` 生成独立母版文档和普通页 `Master` 引用
- `generate_full_screen_from_prompt` 保持禁用，避免 prompt-only 固定模板生成
- `chartData.sourceType` 仍然是 `constant`
- `option.series[0].type` 仍然是 `pie`
- `option.series[0].radius` 使用 AI 输入
- `businessElementId` 和 `parentBusinessElementId` 使用 AI 输入 ID

### 测试文件与规则对应关系

`scripts/test-flow.ts` 是验证入口，具体断言按能力边界拆在 `scripts/test-flow/` 下。测试文件应能追溯到组件描述、模块规则、DashboardSpec 规则或 MCP 对外契约；新增测试时优先按这些边界归类，而不是按某个行业 demo 或固定模板归类。

- `component-*`、`pie-component-*`、`basic-component-*`、`normalizer-*`：覆盖组件 registry、组件能力描述、默认 props、AI 可写字段、禁止字段和归一化规则。
- `module-*`、`chart-panel-*`、`freeform-*`：覆盖模块能力描述、slots 约束、布局规则、语义分组和模块树编译。
- `dashboard-*`：覆盖 DashboardSpec 校验、整屏编译、背景承载、层级顺序、`grouping` 继承、编译期 `theme` 剥离等跨模块规则。
- `mcp-*`：覆盖 MCP 工具暴露、compact/full capability、工具返回结构和完整 schema 输出契约。
- `mcp-prompt-tools-flow`：只覆盖 prompt 旧入口的 MCP smoke 场景，验证整屏 prompt 工具保持禁用，避免 prompt-only 固定模板回流。
- `map-component-*`：覆盖地图/地球嵌套子组件编译的回归场景。

不是每条测试都对应单个组件。背景不能遮挡主内容、空 SVG 拒绝、占位文案拒绝、图表演示数据拒绝、ID 随机且不超长等断言对应的是编译器或 validator 的跨组件规则。prompt 相关测试只用于保护旧入口行为，不能反向沉淀为 MCP 内部的行业模板、关键词分流或固定视觉方案。

测试和 capability 说明都不要把行业短语、主题色或固定结论文案当成规则。例如可以验证“侧边摘要保留分类名、数值、占比，并且不叫图例”，但不应要求“某个行业词必须输出某句固定结论”“某个主题名必须使用某个固定色值”。这类设计判断应由 LLM 根据用户语义完成，MCP 只校验结构、数据同源、层级和安全边界。

## 设计约束

- 不依赖前端仓库路径
- 不读取 `meta.ts`
- 所有 capability/defaultProps 都以内置纯对象维护
- `chartData` 不暴露给 AI 生成，schema 生成时永远恢复为默认值
- 整屏生成由 LLM 设计 DashboardSpec，MCP 不沉淀整屏模板
- `SingleImage` 背景节点必须排在 siblings 最后，避免遮挡内容
- 未知组件会返回清晰错误，例如 `unknown componentName: Xxx`
