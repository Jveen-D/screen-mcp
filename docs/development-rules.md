# Screen MCP Development Rules

`screen-component-mcp` 是大屏编辑器 schema 的能力编译器，不是大屏模板生成器。所有改动都必须保持这个边界：LLM 负责设计，MCP 负责编译、校验、默认 props 合并和输出规范 schema。

## 必守规则

- 公共 MCP 工具只能在 `src/mcp/screenServer.ts` 定义和注册；`src/server.ts`、`src/http-server.ts` 只能负责 transport 启动。
- 新增工具、组件、模块后运行 `npm run docs:generate`，让 README 和 `docs/*-reference.md` 从真实定义生成。
- 新增组件必须补 `capability`、`defaultProps`、必要的 `normalizeProps` 和测试；能力说明要告诉 LLM 何时使用、最小 props、约束和禁止项。
- 新增模块必须说明 slots 契约。图表分析模块用 `ChartPanel`，KPI、表格、地图、媒体、控制器和混合内容优先用 `FreeformModule`；`LayoutPlaceholder` 只允许服务于从零搭建流程的临时布局确认，确认后必须删除。
- 质量问题优先进 validator warning/error，例如越界、重叠、背景遮挡、空 SVG、占位文案、演示图表数据、Gauge 重复数值。
- `DashboardSpec` 仍是整屏主流程：LLM 先设计完整 spec，再调用 `validate_dashboard_spec` 和 `generate_dashboard_schema`。

## 禁止规则

- 不要新增行业模板、主题模板、布局模板、关键词分流或 prompt 到模板的映射。
- 不要让相同描述固定复用历史模板、缓存模板或预置视觉方案。
- 不要在 MCP 里根据关键词硬编码颜色、模块数量、模块位置、图表类型或装饰风格。
- 不要把 `ChartPanel` 扩展成万能模块；非图表或混合内容用 `FreeformModule`。
- 不要让 `SvgDecoration` 回退固定 preset 图标作为默认装饰。
- 不要猜测项目里的现有素材路径；`imageSrc` 只能使用用户明确提供的路径。

## 验证命令

```bash
npm run build
npm run test:flow
npm run check:docs
npm run check:rules
```

提交前优先运行：

```bash
npm run check
```
