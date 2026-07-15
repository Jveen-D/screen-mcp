<!-- AUTO GENERATED DO NOT EDIT - run npm run docs:generate -->

# Screen MCP Tool Reference

这些工具只负责编译、校验和暴露能力，不根据行业、关键词或 prompt 套固定大屏模板。

## Diagnostics

### `get_server_diagnostics`

- Title: Get Server Diagnostics
- Mode: read-only
- Description: Return the running MCP server process diagnostics, including cwd, entry file, pid, startup time, server version, and rules version. Use this to verify whether the active MCP process has loaded the latest copied code.

## Component schema

### `list_components`

- Title: List Components
- Mode: read-only
- Description: List supported large-screen editor components for dashboard schema generation. Use this MCP for 大屏/看板/dashboard/chart component requests, not HTML generation.

### `get_component_capability`

- Title: Get Component Capability
- Mode: read-only
- Description: Return an AI-readable component capability map. Defaults to compact for speed; pass detail:'full' only when exact examples or full rule text are needed.

### `generate_components_schema`

- Title: Generate Component Schema
- Mode: writes schema output
- Description: Generate one complete editor component schema from minimal AI props. Keep props concise; use SingleImage imageBase64 only when the user provides it or the design explicitly needs it. Indicator width >=280px; Gauge already renders its value; SingleImage backgrounds must be last in manual groups.

### `generate_components_schemas`

- Title: Generate Component Schemas
- Mode: writes schema output
- Description: Generate complete editor component schemas from minimal AI props. Returned SingleImage nodes are sorted to the bottom layer. Keep inputs concise and prefer SvgDecoration/style backgrounds unless base64 image content is actually needed.

## Module schema

### `list_modules`

- Title: List Modules
- Mode: read-only
- Description: List supported large-screen composition modules such as ChartPanel and FreeformModule. Use ChartPanel for chart-analysis panels; use FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components.

### `get_module_capability`

- Title: Get Module Capability
- Mode: read-only
- Description: Return an AI-readable module capability map. Defaults to compact for speed; pass detail:'full' only when exact examples or full rule text are needed.

### `generate_module_schema`

- Title: Generate Module Schema
- Mode: writes schema output
- Description: Generate editor component schemas from one explicit module input. Use ChartPanel for chart panels and FreeformModule for arbitrary mixed modules. Inputs should be LLM-designed slots, not prompt-only templates; SingleImage backgrounds are sorted last.

### `generate_module_tree_schema`

- Title: Generate Dashboard Module Tree Schema
- Mode: writes schema output
- Description: Generate one editor-ready __Group__ module tree from explicit module slots. Supports common grouping.mode='semantic' and grouping.singleChildGroup=true. SingleImage backgrounds are moved to the bottom layer.

## DashboardSpec

### `validate_dashboard_spec`

- Title: Validate Dashboard Spec
- Mode: read-only
- Description: Validate a LLM-authored DashboardSpec without generating a template. Use this after the LLM has decided theme, modules, explicit component groups, layout, components, optional grouping, and optional BIM/model reservedAreas. Returns errors and warnings such as missing fields, invalid grouping mode, unpositioned explicit groups, invalid reserved areas, empty SvgDecoration placeholders, placeholder SingleText copy, missing chart data, missing ChartPanel auxiliaryTexts, too many ungrouped components, out-of-canvas modules, overlapping top-level regions, low text/background contrast, SingleText content that may overflow its declared box, empty left/right/bottom edge padding without custom SvgDecoration accents, or top-level regions overlapping reserved BIM model space.

### `generate_dashboard_schema`

- Title: Generate Dashboard Schema
- Mode: writes schema output
- Description: Compile a complete LLM-authored DashboardSpec into one editor-ready __Group__ tree. The LLM must decide the theme, module list, explicit component groups, chart choices, layout coordinates, copy, backgrounds, decorations, edge-padding accents, optional grouping, and optional BIM/model reservedAreas before calling this tool. DashboardSpec.groups can wrap LLM-declared related components, but each explicit group must include complete absolute style left/top/width/height; DashboardSpec.grouping is inherited by groups/modules that do not define their own grouping. DashboardSpec.reservedAreas with purpose/type/kind 'bim-model' are compile-time constraints only: they are validated for overlap, suppress automatic full-canvas background fallback, and are not emitted into the final schema. This tool compiles and validates the spec, rejects empty SvgDecoration placeholders, placeholder text, missing/demo chart data, and manual ChartPanel modules without auxiliaryTexts, warns about objective contrast, SingleText fit, and empty edge-padding issues, strips compile-time theme from output props, adds real SvgDecoration background carriers for bare groups/modules and bare canvas when no BIM/model reserved area exists, and does not infer a full-screen layout from a prompt or apply a fixed dashboard template.

### `validate_dashboard_project_spec`

- Title: Validate Dashboard Project Spec
- Mode: read-only
- Description: Validate a LLM-authored multi-page DashboardProjectSpec. Reusable master designs belong in masters; normal screens belong in pages and reference masters by masterLogicalIds. Every master and page is validated as a full DashboardSpec with the same structure, real-data, grouping, layout, contrast, text-fit, and visual-space quality rules used for an independent dashboard. Rejects duplicate document logicalIds, duplicate or unknown master references, masters referencing other masters, invalid nested DashboardSpecs, and pages with neither own content nor a master.

### `generate_dashboard_project_schema`

- Title: Generate Dashboard Project Schema
- Mode: writes schema output
- Description: Compile a complete LLM-authored DashboardProjectSpec into an editor-ready project schema with documents. Every masters/pages item is a full DashboardSpec and must meet the same quality bar as an independently generated dashboard: complete information hierarchy, balanced content density, meaningful canvas usage, explicit absolute layout, real chart data and text, intentional groups/modules, readable contrast, sufficient text boxes, and LLM-authored backgrounds and decorations. Do not simplify pages, leave meaningless empty regions, or mechanically repeat one layout merely because the project contains multiple pages. Shared masters carry only reusable visual structure and must not replace page-specific business design. Each masters item becomes an independent pageType='master' document; each pages item becomes a pageType='page' document whose masterLogicalIds compile to Master reference nodes using the exact master document ids. Automatic full-canvas backgrounds are suppressed for masters and pages using masters so inherited layers cannot cover each other; author an explicit background component when needed. Normal pages are emitted first, and existing single-dashboard generation remains unchanged.

## Legacy compatibility

### `generate_full_screen_from_prompt`

- Title: Generate Full Screen Dashboard From Prompt
- Mode: writes schema output
- Description: Disabled for production generation because prompt-only full-screen generation encourages fixed templates. Create a DashboardSpec with LLM-chosen theme, modules, layout, and slots, then call generate_dashboard_schema.
