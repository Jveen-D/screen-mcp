import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
  sortComponentSchemas,
  sortEditorTreeChildren,
} from "./core/schema.js";
import {
  getCompactComponentCapability,
  getComponentCapability,
  listComponents,
} from "./core/registry.js";
import {
  getCompactModuleCapability,
  generateModuleSchema,
  generateModuleTreeSchema,
  getModuleCapability,
  listModules,
} from "./core/modules.js";
import { generateFullScreenFromPrompt } from "./core/fullScreenPromptModule.js";
import {
  generateDashboardSchema,
  validateDashboardSpec,
} from "./core/dashboard.js";
import type { EditorTreeNode, JsonObject } from "./types/component.js";

const SERVER_VERSION = "0.1.0";
const RULES_VERSION = "2026-06-24.06-no-demo-chart-data-direct-tools";
const SERVER_STARTED_AT = new Date();
const SERVER_ENTRY_FILE = fileURLToPath(import.meta.url);

const server = new McpServer(
  {
    name: "screen-component-mcp",
    version: SERVER_VERSION,
  },
  {
    instructions:
      "This MCP server compiles large-screen/dashboard designs into editor schema. The LLM owns design decisions: theme colors, module list, chart choices, layout coordinates, copy, background, and decorations. For full-screen dashboards, first create a structured DashboardSpec, call validate_dashboard_spec, then call generate_dashboard_schema. Do not call generate_full_screen_from_prompt for production generation; it is disabled because prompt-only generation encourages fixed templates. Use ChartPanel for chart-analysis panels and FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components. Use DashboardSpec.groups for LLM-declared related top-level component regions such as headers, KPI rows, and custom mixed panels; every DashboardSpec.groups item must declare a complete absolute style left/top/width/height and should not be used as an unpositioned bucket. Do not flatten many unrelated elements into DashboardSpec.components. ChartPanel defaults to manual layout and only compiles slots explicitly provided by the LLM; DashboardSpec and direct module generation for manual ChartPanel must include slots.auxiliaryTexts with at least one real SingleText insight, side summary, center metric, or conclusion. Module/grouping is common: set grouping.mode='semantic' and grouping.singleChildGroup=true when you want semantic sections grouped; earlier siblings render above later siblings, so main content must be above decorations/background and background groups must stay last. __Group__ is only an editor grouping container and is not a visual background; module root groups may carry style only for editor positioning. DashboardSpec compilation adds real SvgDecoration background carriers for the full canvas and bare groups/modules when no explicit background carrier exists. DashboardSpec and direct chart component generation must carry real chartData.constant.data, or supported ChartPanel dataItems, and SingleText must carry real textContent; do not rely on demo categories or placeholder copy. Theme is compile-time context and is stripped from final component props. SvgDecoration decorations should use LLM-authored custom svgContent unless a non-empty preset id is explicitly chosen; MCP does not fall back to a default preset icon and rejects empty decoration placeholders in DashboardSpec. Do not guess or select existing project asset paths; use imageSrc only when the user explicitly provides a path. Hard constraints: Indicator width should be at least 280px and text lineHeight should be 1; Weather in a 1920x1080 header should be 280-300px wide; Gauge renders its own value, so do not overlay duplicate SingleText and set indicatorConfig.suffix correctly. If the user asks for 完整schema, 完整JSON, full schema, or complete schema, include the complete JSON returned by the tool.",
  },
);

function asToolContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function handleToolError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

function serverDiagnostics(): JsonObject {
  return {
    serverName: "screen-component-mcp",
    serverVersion: SERVER_VERSION,
    rulesVersion: RULES_VERSION,
    rulesFingerprint: [
      "customer-source-two-line-summary",
      "preserve-original-category-name",
      "side-summary-min-text-width",
      "pie-label-legend-spacing",
      "pie-legend-offset",
      "pie-center-radius-layout",
      "pie-legend-wrap-forecast",
      "side-summary-svg-row-rules",
      "single-line-legend-pie-scale",
      "bottom-conclusion-side-card-spacing",
      "summary-sticker-conclusion-gap",
      "semantic-side-summary",
      "side-card-connector-anchor",
      "side-summary-label-dedupe",
      "bottom-conclusion-muted-weight",
      "light-structure-restore",
      "side-summary-color-anchors",
      "no-svg-preset-fallback",
      "single-text-line-box",
      "pie-main-area-alignment",
      "visible-pie-labels",
      "single-line-side-summary-height",
      "structured-side-summary-texts",
      "center-total-above-pie",
      "bottom-conclusion-single-line-box",
      "larger-main-chart-safe-area",
      "multi-panel-decoration-diversity",
      "center-summary-text-spacing",
      "component-id-max-50-randomized",
      "complete-schema-response-contract",
      "single-image-bottom-layer",
      "single-image-tree-sort",
      "spatial-design-workflow",
      "content-fit-side-card",
      "indicator-text-line-height-one",
      "gauge-suffix-mandatory",
      "visible-svg-structure-decorations",
      "default-entry-animation-strategy",
      "freeform-module-explicit-children",
      "common-semantic-module-grouping",
      "dashboard-grouping-inheritance",
      "main-content-above-decoration",
      "no-inferred-existing-assets",
      "dashboard-explicit-component-groups",
      "background-group-bottom-layer",
      "dashboard-group-style-required",
      "no-empty-svg-decoration",
      "dashboard-root-background-component",
      "module-background-carrier-fallback",
      "svg-background-grouping",
      "compiler-theme-stripped",
      "module-group-style-props",
      "dashboard-placeholder-text-rejected",
      "dashboard-chart-data-required",
      "chartpanel-auxiliary-text-required",
      "direct-chart-demo-data-rejected",
      "module-chartpanel-auxiliary-text-required",
      "ringchart-dense-legend-label-layout",
      "filled-panel-frame-background",
    ],
    process: {
      pid: process.pid,
      ppid: process.ppid,
      cwd: process.cwd(),
      execPath: process.execPath,
      argv: process.argv,
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: SERVER_STARTED_AT.toISOString(),
    },
    source: {
      entryFile: SERVER_ENTRY_FILE,
      importMetaUrl: import.meta.url,
    },
  };
}

const aiComponentPropsInput = z
  .object({
    componentName: z.string().min(1),
    logicalId: z.string().min(1),
    parentLogicalId: z.string().min(1),
    style: z.record(z.unknown()),
  })
  .passthrough();

const moduleInput = z
  .object({
    moduleName: z.string().min(1),
    logicalId: z.string().min(1),
    parentLogicalId: z.string().min(1),
    style: z.object({
      left: z.number(),
      top: z.number(),
      width: z.number(),
      height: z.number(),
      position: z.literal("absolute").optional(),
      zIndex: z.number().optional(),
    }).passthrough(),
    slots: z.record(z.unknown()),
  })
  .passthrough();

const fullScreenPromptInput = z
  .object({
    prompt: z.string().min(1),
    logicalId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    theme: z.record(z.unknown()).optional(),
  })
  .passthrough();

const dashboardSpecInput = z
  .object({
    logicalId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    canvas: z
      .object({
        width: z.number().optional(),
        height: z.number().optional(),
      })
      .passthrough()
      .optional(),
    theme: z.record(z.unknown()).optional(),
    components: z.array(z.record(z.unknown())).optional(),
    groups: z.array(z.record(z.unknown())).optional(),
    modules: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

const capabilityDetailInput = {
  componentName: z.string().min(1),
  detail: z.enum(["compact", "full"]).optional(),
};

const moduleCapabilityDetailInput = {
  moduleName: z.string().min(1),
  detail: z.enum(["compact", "full"]).optional(),
};

server.registerTool(
  "get_server_diagnostics",
  {
    title: "Get Server Diagnostics",
    description:
      "Return the running MCP server process diagnostics, including cwd, entry file, pid, startup time, server version, and rules version. Use this to verify whether the active MCP process has loaded the latest copied code.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => asToolContent(serverDiagnostics()),
);

server.registerTool(
  "list_components",
  {
    title: "List Components",
    description:
      "List supported large-screen editor components for dashboard schema generation. Use this MCP for 大屏/看板/dashboard/chart component requests, not HTML generation.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => asToolContent(listComponents()),
);

server.registerTool(
  "get_component_capability",
  {
    title: "Get Component Capability",
    description:
      "Return an AI-readable component capability map. Defaults to compact for speed; pass detail:'full' only when exact examples or full rule text are needed.",
    inputSchema: capabilityDetailInput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ componentName, detail }) => {
    try {
      return asToolContent(
        detail === "full"
          ? getComponentCapability(componentName)
          : getCompactComponentCapability(componentName),
      );
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_components_schema",
  {
    title: "Generate Component Schema",
    description:
      "Generate one complete editor component schema from minimal AI props. Keep props concise; use SingleImage imageBase64 only when the user provides it or the design explicitly needs it. Indicator width >=280px; Gauge already renders its value; SingleImage backgrounds must be last in manual groups.",
    inputSchema: aiComponentPropsInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (props) => {
    try {
      const schema = generateComponentsSchema(props as JsonObject);
      return asToolContent(sortComponentSchemas([schema])[0]);
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_components_schemas",
  {
    title: "Generate Component Schemas",
    description:
      "Generate complete editor component schemas from minimal AI props. Returned SingleImage nodes are sorted to the bottom layer. Keep inputs concise and prefer SvgDecoration/style backgrounds unless base64 image content is actually needed.",
    inputSchema: {
      componentsProps: z.array(aiComponentPropsInput),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ componentsProps }) => {
    try {
      return asToolContent(
        sortComponentSchemas(
          generateComponentsSchemas(componentsProps as JsonObject[]),
        ),
      );
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "list_modules",
  {
    title: "List Modules",
    description:
      "List supported large-screen composition modules such as ChartPanel and FreeformModule. Use ChartPanel for chart-analysis panels; use FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async () => asToolContent(listModules()),
);

server.registerTool(
  "get_module_capability",
  {
    title: "Get Module Capability",
    description:
      "Return an AI-readable module capability map. Defaults to compact for speed; pass detail:'full' only when exact examples or full rule text are needed.",
    inputSchema: moduleCapabilityDetailInput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ moduleName, detail }) => {
    try {
      return asToolContent(
        detail === "full"
          ? getModuleCapability(moduleName)
          : getCompactModuleCapability(moduleName),
      );
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_module_schema",
  {
    title: "Generate Module Schema",
    description:
      "Generate editor component schemas from one explicit module input. Use ChartPanel for chart panels and FreeformModule for arbitrary mixed modules. Inputs should be LLM-designed slots, not prompt-only templates; SingleImage backgrounds are sorted last.",
    inputSchema: moduleInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(
        sortComponentSchemas(generateModuleSchema(input as JsonObject)),
      );
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_module_tree_schema",
  {
    title: "Generate Dashboard Module Tree Schema",
    description:
      "Generate one editor-ready __Group__ module tree from explicit module slots. Supports common grouping.mode='semantic' and grouping.singleChildGroup=true. SingleImage backgrounds are moved to the bottom layer.",
    inputSchema: moduleInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      const tree = generateModuleTreeSchema(input as JsonObject) as EditorTreeNode;
      return asToolContent(sortEditorTreeChildren(tree));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "validate_dashboard_spec",
  {
    title: "Validate Dashboard Spec",
    description:
      "Validate a LLM-authored DashboardSpec without generating a template. Use this after the LLM has decided theme, modules, explicit component groups, layout, components, and optional grouping. Returns errors and warnings such as missing fields, invalid grouping mode, unpositioned explicit groups, empty SvgDecoration placeholders, placeholder SingleText copy, missing chart data, missing ChartPanel auxiliaryTexts, too many ungrouped components, out-of-canvas modules, or overlapping top-level regions.",
    inputSchema: dashboardSpecInput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(validateDashboardSpec(input as JsonObject));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_dashboard_schema",
  {
    title: "Generate Dashboard Schema",
    description:
      "Compile a complete LLM-authored DashboardSpec into one editor-ready __Group__ tree. The LLM must decide the theme, module list, explicit component groups, chart choices, layout coordinates, copy, backgrounds, decorations, and optional grouping before calling this tool. DashboardSpec.groups can wrap LLM-declared related components, but each explicit group must include complete absolute style left/top/width/height; DashboardSpec.grouping is inherited by groups/modules that do not define their own grouping. This tool compiles and validates the spec, rejects empty SvgDecoration placeholders, placeholder text, missing/demo chart data, and manual ChartPanel modules without auxiliaryTexts, strips compile-time theme from output props, adds real SvgDecoration background carriers for bare canvas/groups/modules, and does not infer a full-screen layout from a prompt or apply a fixed dashboard template.",
    inputSchema: dashboardSpecInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(generateDashboardSchema(input as JsonObject));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_full_screen_from_prompt",
  {
    title: "Generate Full Screen Dashboard From Prompt",
    description:
      "Disabled for production generation because prompt-only full-screen generation encourages fixed templates. Create a DashboardSpec with LLM-chosen theme, modules, layout, and slots, then call generate_dashboard_schema.",
    inputSchema: fullScreenPromptInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      const tree = generateFullScreenFromPrompt(input as JsonObject) as EditorTreeNode;
      return asToolContent(sortEditorTreeChildren(tree));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
