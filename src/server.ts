import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
} from "./core/schema.js";
import {
  getComponentCapability,
  listComponents,
} from "./core/registry.js";
import {
  generateModuleSchema,
  generateModuleTreeSchema,
  getModuleCapability,
  listModules,
} from "./core/modules.js";
import { generateScreenModuleFromPrompt } from "./core/promptModule.js";
import { generateFullScreenFromPrompt } from "./core/fullScreenPromptModule.js";
import type { JsonObject } from "./types/component.js";

const SERVER_VERSION = "0.1.0";
const RULES_VERSION = "2026-06-12.12-remove-demo-chart";
const SERVER_STARTED_AT = new Date();
const SERVER_ENTRY_FILE = fileURLToPath(import.meta.url);

const server = new McpServer(
  {
    name: "screen-component-mcp",
    version: SERVER_VERSION,
  },
  {
    instructions:
      "This MCP server is the authoritative tool for large-screen/dashboard design schema generation. When the user asks in Chinese or English to generate, design, create, or modify a 大屏/看板/dashboard/module/chart panel/风险等级分析/销售分析, call this MCP instead of generating HTML, SVG-only mockups, React pages, or static prose. Prefer generate_full_screen_from_prompt when the user describes a full-screen dashboard with a theme but does not list individual components or zones (e.g. '生成一个水电站智慧运行监测大屏，1920×1080'); prefer generate_screen_module_from_prompt for terse single-module requests; prefer generate_module_tree_schema when structured module props are already available. AI always has design authority for backgrounds, textures, borders, and tech-style decorations: actively use SingleImage (AI-generated base64 backgrounds are allowed and encouraged) and SvgDecoration instead of only adjusting style.backgroundColor, unless the user explicitly prohibits decorations. For full-screen requests, fill the entire 1920×1080 canvas with modules: each module must have a visible title and visible SVG decorations; do not leave large blank areas unless the user explicitly asks for minimalism. Additional hard constraints: Indicator components must be wide enough to avoid line wrapping (min 280px, prefer 320px when showing title + digits + suffix); Weather components in a 1920×1080 header should be 280-300px wide to prevent line breaks; Gauge already renders its own value and suffix, so never overlay an extra SingleText for the same value, and always set the correct suffix (e.g. '%' for percentages, not the default 'km/h'); all panels/modules on the same screen must share consistent background colors, title badges, and border/decoration language. If the user asks for 完整schema, 完整 Schema, 完整JSON, full schema, or complete schema, the assistant's final answer must include the complete JSON returned by the MCP tool in a fenced json code block. Do not summarize, omit children, replace it with prose, or ask the user to request the full schema again.",
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
      "default-svg-fallback-only",
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
      "visible-svg-structure-decorations",
      "default-entry-animation-strategy",
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

const promptModuleInput = z
  .object({
    prompt: z.string().min(1),
    logicalId: z.string().min(1).optional(),
    parentLogicalId: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    style: z.record(z.unknown()).optional(),
    dataItems: z.array(z.record(z.unknown())).optional(),
    theme: z.record(z.unknown()).optional(),
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
      "Return the AI-readable capability map for a large-screen editor component. Use before generating component schema for dashboard design tasks.",
    inputSchema: {
      componentName: z.string().min(1),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ componentName }) => {
    try {
      return asToolContent(getComponentCapability(componentName));
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
      "Generate one complete editor component schema for the large-screen editor from one minimal AI props object. Use this instead of hand-writing HTML/SVG when the user wants 大屏/dashboard elements. AI has continuous design authority: actively use SingleImage (generate base64 backgrounds when helpful) and SvgDecoration for backgrounds, textures, borders, corner marks, and glow decorations rather than only adjusting style.backgroundColor, unless the user explicitly prohibits decorations. Constraints: Indicator width should be at least 280px to avoid wrapping; Weather in a 1920×1080 header should be 280-300px; Gauge already shows its own value, do not overlay SingleText and use the correct suffix. If the user asks for 完整schema/full schema/complete schema, include the complete returned JSON in the final answer, not a summary.",
    inputSchema: aiComponentPropsInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (props) => {
    try {
      return asToolContent(generateComponentsSchema(props as JsonObject));
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
      "Generate complete large-screen editor component schemas from an array of minimal AI props objects. Use this instead of producing HTML pages for dashboard components. AI has continuous design authority: include SingleImage (actively generate base64 backgrounds when helpful) and SvgDecoration components for backgrounds, textures, borders, corner marks, and glow decorations rather than only setting style.backgroundColor, unless the user explicitly prohibits decorations. Constraints: Indicator width should be at least 280px to avoid wrapping; Weather in a 1920×1080 header should be 280-300px; Gauge already shows its own value, do not overlay SingleText and use the correct suffix; all panels should share consistent backgrounds, title badges, and decoration language. If the user asks for 完整schema/full schema/complete schema, include the complete returned JSON array in the final answer, not a summary.",
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
        generateComponentsSchemas(componentsProps as JsonObject[]),
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
      "List supported large-screen composition modules such as ChartPanel. Use for user requests like 生成销售大屏, 风险等级分析, 做一个看板模块.",
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
      "Return the AI-readable capability map for a large-screen composition module. Use before generate_module_tree_schema when building dashboard editor schema.",
    inputSchema: {
      moduleName: z.string().min(1),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ moduleName }) => {
    try {
      return asToolContent(getModuleCapability(moduleName));
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
      "Generate complete large-screen editor component schemas from one module composition input. For 大屏/看板/dashboard/chart panel requests, use this MCP instead of generating HTML. AI has continuous design authority: generate base64 backgrounds with SingleImage and decorative SVG elements with SvgDecoration rather than only setting style.backgroundColor, unless the user explicitly prohibits decorations. If the user asks for 完整schema/full schema/complete schema, include the complete returned JSON array in the final answer, not a summary.",
    inputSchema: moduleInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(generateModuleSchema(input as JsonObject));
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
      "Generate one editor-ready grouped large-screen/dashboard module tree schema. The root node is __Group__ and children are full component nodes. This is the preferred tool when the user asks to generate a 大屏模块/看板模块/风险等级分析/销售分析; do not answer with HTML. AI has continuous design authority: include SingleImage (actively generate base64 backgrounds when helpful) and SvgDecoration components for backgrounds, textures, borders, and glow decorations rather than only setting style.backgroundColor, unless the user explicitly prohibits decorations. If the user asks for 完整schema/full schema/complete schema, include the complete returned JSON object in the final answer, not a summary or partial excerpt.",
    inputSchema: moduleInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(generateModuleTreeSchema(input as JsonObject));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

server.registerTool(
  "generate_screen_module_from_prompt",
  {
    title: "Generate Screen Module From User Prompt",
    description:
      "Use this first for terse end-user requests such as “生成销售大屏”, “做个风险等级分析”, “数据：高风险18，中风险37，低风险71”. It converts natural language into an editor-ready large-screen __Group__ schema via ChartPanel. Do not generate HTML, React, or hand-drawn SVG for these dashboard/module requests. AI has continuous design authority: generate base64 backgrounds with SingleImage and decorative SVG elements with SvgDecoration rather than only setting style.backgroundColor, unless the user explicitly prohibits decorations. If the user asks for 完整schema/full schema/complete schema/完整JSON, the final answer must paste the complete returned JSON object in a fenced json code block.",
    inputSchema: promptModuleInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(generateScreenModuleFromPrompt(input as JsonObject));
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
      "Use this when the user asks for a complete full-screen dashboard with a theme but does not specify individual components or zones, e.g. '生成一个水电站智慧运行监测大屏，科技风深色主题，1920×1080'. It returns a root __Group__ sized 1920×1080 containing a full-screen SingleImage background, header, KPIs, and multiple ChartPanel modules that fill the canvas. Every module has a visible title and SVG decorations. Do not generate HTML or hand-drawn SVG for these requests. If the user asks for 完整schema/full schema/complete schema/完整JSON, the final answer must paste the complete returned JSON object in a fenced json code block.",
    inputSchema: fullScreenPromptInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async (input) => {
    try {
      return asToolContent(generateFullScreenFromPrompt(input as JsonObject));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
