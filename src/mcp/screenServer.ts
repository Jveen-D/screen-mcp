import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
  sortComponentSchemas,
  sortEditorTreeChildren,
} from "../core/schema.js";
import {
  getCompactComponentCapability,
  getComponentCapability,
  listComponents,
} from "../core/registry.js";
import {
  getCompactModuleCapability,
  generateModuleSchema,
  generateModuleTreeSchema,
  getModuleCapability,
  listModules,
} from "../core/modules.js";
import { generateFullScreenFromPrompt } from "../core/fullScreenPromptModule.js";
import {
  generateDashboardSchema,
  validateDashboardSpec,
} from "../core/dashboard.js";
import {
  generateDashboardProjectSchema,
  validateDashboardProjectSpec,
} from "../core/dashboardProject.js";
import type { EditorTreeNode, JsonObject } from "../types/component.js";

export const SERVER_VERSION = "0.1.0";
export const RULES_VERSION = "2026-07-21.02-explicit-layer-role";

const SERVER_STARTED_AT = new Date();

export const SCREEN_MCP_INSTRUCTIONS =
  "Every returned editor node uses props.layerRole=content, decoration, or background. SingleImage also keeps imageLayerRole identical to layerRole. Siblings are compiled in content, decoration, background order; callers must set explicit layerRole for groups, SvgDecoration, and SingleImage instead of relying on names or zIndex. " +
  "This MCP server compiles large-screen/dashboard designs into editor schema. The LLM owns design decisions: theme colors, module list, chart choices, layout coordinates, copy, background, and decorations. For full-screen dashboards, first create a structured DashboardSpec, call validate_dashboard_spec, then call generate_dashboard_schema. Do not call generate_full_screen_from_prompt for production generation; it is disabled because prompt-only generation encourages fixed templates. Use ChartPanel for chart-analysis panels and FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components. Use DashboardSpec.groups for LLM-declared related top-level component regions such as headers, KPI rows, and custom mixed panels; every DashboardSpec.groups item must declare a complete absolute style left/top/width/height and should not be used as an unpositioned bucket. Do not flatten many unrelated elements into DashboardSpec.components. Full-screen dashboards should treat left/right/bottom canvas padding as active visual space: add LLM-authored custom SvgDecoration edge rails, tick marks, scan lines, signal ticks, corner structures, or subtle texture accents when those bands would otherwise be empty, while keeping them below business content and above only the background. When the user explicitly asks for a BIM/model screen, the LLM may add DashboardSpec.reservedAreas with purpose/type/kind 'bim-model' and a complete absolute style to keep that model space empty; reservedAreas are compile-time constraints only, are not emitted into the final schema, and suppress only the automatic full-canvas background fallback. ChartPanel defaults to manual layout and only compiles slots explicitly provided by the LLM; DashboardSpec and direct module generation for manual ChartPanel must include slots.auxiliaryTexts with at least one real SingleText insight, side summary, center metric, or conclusion. Module/grouping is common: set grouping.mode='semantic' and grouping.singleChildGroup=true when you want semantic sections grouped; earlier siblings render above later siblings, so main content must be above decorations/background and background groups must stay last. __Group__ is only an editor grouping container and is not a visual background; module root groups may carry style only for editor positioning. DashboardSpec child components should prefer canvas absolute coordinates; when a module/group child is clearly using local coordinates, generate_dashboard_schema offsets it to canvas coordinates for editor rendering. DashboardSpec compilation adds real SvgDecoration background carriers for the full canvas and bare groups/modules when no explicit BIM/model reserved area exists; bare groups/modules still receive background carriers. DashboardSpec and direct chart component generation must carry real chartData.constant.data, or supported ChartPanel dataItems, and SingleText must carry real textContent; do not rely on demo categories or placeholder copy. Reserve enough width and height for SingleText content and keep explicit text/background colors readable; validate_dashboard_spec reports objective contrast and text-fit warnings without replacing LLM-authored design choices. Theme is compile-time context and is stripped from final component props. SvgDecoration decorations should use LLM-authored custom svgContent unless a non-empty preset id is explicitly chosen; MCP does not fall back to a default preset icon and rejects empty decoration placeholders in DashboardSpec. Do not guess or select existing project asset paths; use imageSrc only when the user explicitly provides a path. SingleImage uses imageLayerRole='background' for full-screen or panel backgrounds and imageLayerRole='content' for photos, renders, logos, or complex illustrations that must stay in the main content layer above panel backgrounds. Hard constraints: Indicator width should be at least 280px and text lineHeight should be 1; KPI labels should be explicit SingleText siblings and Indicator should focus on value/prefix/suffix, with DashboardSpec compilation externalizing real Indicator titleName as SingleText when needed; Weather in a 1920x1080 header should be 280-300px wide; Gauge renders its own value, so do not overlay duplicate SingleText and set indicatorConfig.suffix correctly. For multi-page projects with shared masters, create a DashboardProjectSpec, put reusable LLM-authored designs into masters, put normal screens into pages, reference masters from each page with masterLogicalIds, call validate_dashboard_project_spec, then call generate_dashboard_project_schema. Every page must meet the same quality bar as an independently generated DashboardSpec: complete information hierarchy, balanced visual density, meaningful use of canvas space, real business data, and page-specific component composition. Do not thin or mechanically duplicate pages merely because one project contains several documents. Master documents and pages using masters do not receive automatic full-canvas backgrounds, so the LLM must author explicit background components when needed. If the user asks for 完整schema, 完整JSON, full schema, or complete schema, include the complete JSON returned by the tool.";

export const RULES_FINGERPRINT = [
  "chartpanel-flat-slot-props-compatibility",
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
  "single-image-content-layer-role",
  "explicit-editor-layer-role",
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
  "dashboard-descriptive-group-title",
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
  "component-capability-neutral-examples",
  "pie-legend-center-overlap-guard",
  "single-text-transparent-background",
  "base-table-line-height-guard",
  "ringchart-side-legend-radius-balance",
  "dashboard-local-coordinate-guard",
  "percentage-bar-icon-hidden-default",
  "overlong-hex-color-trim",
  "scroll-list-opaque-header-background",
  "chartpanel-full-module-main-chart",
  "chartpanel-grid-safe-area-layout",
  "chartpanel-pie-center-radius-safe-area",
  "dashboard-bim-reserved-area",
  "dashboard-bim-skip-root-background",
  "dashboard-reserved-area-overlap-warning",
  "bottom-auxiliary-chart-grid-guard",
  "ringchart-bottom-legend-radius-guard",
  "explicit-group-title-text-bucket",
  "circular-chart-center-text-alignment",
  "dashboard-single-text-fit-guard",
  "overlapping-unit-label-guard",
  "cartesian-axis-unit-name-guard",
  "funnel-module-balance-guard",
  "cartesian-series-name-data-type-guard",
  "cartesian-business-type-dimension-guard",
  "integer-chart-value-precision",
  "circular-center-text-stack-spacing",
  "circular-bottom-legend-safe-area",
  "gauge-percent-text-consistency-warning",
  "circular-outside-label-side-text-guard",
  "cartesian-top-legend-text-safe-area",
  "base-table-column-fit-guard",
  "indicator-compact-height-typography",
  "dashboard-decoration-below-content-zindex",
  "ringchart-readable-medium-radius",
  "circular-center-hole-fit-guard",
  "circular-center-companion-alignment",
  "circular-bottom-legend-text-warning",
  "cartesian-offset-top-legend-text-safe-area",
  "scroll-list-short-ordered-static-first-screen",
  "indicator-readable-separation-guard",
  "indicator-title-external-single-text",
  "dashboard-indicator-value-title-split",
  "dashboard-edge-padding-decoration-warning",
  "svg-decoration-edge-padding-guidance",
  "dashboard-theme-contrast-warning",
  "dashboard-single-text-contrast-warning",
  "dashboard-single-text-overflow-warning",
  "dashboard-project-master-documents",
  "dashboard-page-master-references",
  "dashboard-master-reference-validation",
  "dashboard-project-page-quality-parity",
  "dashboard-base-table-real-data-validation",
] as const;

export type ScreenToolCategory =
  | "diagnostics"
  | "component"
  | "module"
  | "dashboard"
  | "legacy";

export const SCREEN_TOOL_CATEGORY_LABELS: Record<ScreenToolCategory, string> = {
  diagnostics: "Diagnostics",
  component: "Component schema",
  module: "Module schema",
  dashboard: "DashboardSpec",
  legacy: "Legacy compatibility",
};

type ScreenToolAnnotations = {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  openWorldHint: boolean;
};

type ScreenToolConfig = {
  title: string;
  description: string;
  inputSchema?: z.ZodRawShape | z.ZodTypeAny;
  annotations: ScreenToolAnnotations;
};

export type ScreenToolDefinition = {
  name: string;
  category: ScreenToolCategory;
  config: ScreenToolConfig;
  handler: (input: JsonObject) => Promise<CallToolResult> | CallToolResult;
};

export interface ScreenServerOptions {
  entryFileUrl?: string;
}

function asToolContent(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function handleToolError(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}

function serverDiagnostics(options: ScreenServerOptions = {}): JsonObject {
  const entryFileUrl = options.entryFileUrl ?? import.meta.url;

  return {
    serverName: "screen-component-mcp",
    serverVersion: SERVER_VERSION,
    rulesVersion: RULES_VERSION,
    rulesFingerprint: [...RULES_FINGERPRINT],
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
      entryFile: fileURLToPath(entryFileUrl),
      importMetaUrl: entryFileUrl,
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
    autoPanelBackgrounds: z.boolean().optional().describe(
      "Set false when every panel background must be authored explicitly, such as pixel-accurate reconstruction.",
    ),
    components: z.array(z.record(z.unknown())).optional(),
    groups: z.array(z.record(z.unknown())).optional(),
    modules: z.array(z.record(z.unknown())).optional(),
    reservedAreas: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

const dashboardProjectDocumentInput = dashboardSpecInput.extend({
  logicalId: z.string().min(1),
  masterLogicalIds: z.array(z.string().min(1)).optional(),
});

const dashboardProjectSpecInput = z
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
    grouping: z.record(z.unknown()).optional(),
    autoPanelBackgrounds: z.boolean().optional().describe(
      "Inherited by project documents; false suppresses automatic group/module panel backgrounds.",
    ),
    masters: z.array(dashboardProjectDocumentInput).optional(),
    pages: z.array(dashboardProjectDocumentInput).optional(),
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

export function getScreenToolDefinitions(
  options: ScreenServerOptions = {},
): ScreenToolDefinition[] {
  return [
    {
      name: "get_server_diagnostics",
      category: "diagnostics",
      config: {
        title: "Get Server Diagnostics",
        description:
          "Return the running MCP server process diagnostics, including cwd, entry file, pid, startup time, server version, and rules version. Use this to verify whether the active MCP process has loaded the latest copied code.",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async () => asToolContent(serverDiagnostics(options)),
    },
    {
      name: "list_components",
      category: "component",
      config: {
        title: "List Components",
        description:
          "List supported large-screen editor components for dashboard schema generation. Use this MCP for 大屏/看板/dashboard/chart component requests, not HTML generation.",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async () => asToolContent(listComponents()),
    },
    {
      name: "get_component_capability",
      category: "component",
      config: {
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
      handler: async (input) => {
        try {
          const componentName = String(input.componentName);
          return asToolContent(
            input.detail === "full"
              ? getComponentCapability(componentName)
              : getCompactComponentCapability(componentName),
          );
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_components_schema",
      category: "component",
      config: {
        title: "Generate Component Schema",
        description:
          "Generate one complete editor component schema from minimal AI props. Keep props concise; use SingleImage imageBase64 only when the user provides it or the design explicitly needs it. Indicator width >=280px; Gauge already renders its value; SingleImage must set identical layerRole and imageLayerRole values: background for bottom layers, content for photos, renders, logos, and complex illustrations.",
        inputSchema: aiComponentPropsInput,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          const schema = generateComponentsSchema(input);
          return asToolContent(sortComponentSchemas([schema])[0]);
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_components_schemas",
      category: "component",
      config: {
        title: "Generate Component Schemas",
        description:
          "Generate complete editor component schemas from minimal AI props. Siblings are sorted by layerRole in content, decoration, background order. SingleImage must keep imageLayerRole identical to layerRole. Keep inputs concise and prefer SvgDecoration/style backgrounds unless image content is actually needed.",
        inputSchema: {
          componentsProps: z.array(aiComponentPropsInput),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          const componentsProps = Array.isArray(input.componentsProps)
            ? input.componentsProps.filter(
              (item): item is JsonObject =>
                typeof item === "object" && item !== null && !Array.isArray(item),
            )
            : [];
          return asToolContent(
            sortComponentSchemas(generateComponentsSchemas(componentsProps)),
          );
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "list_modules",
      category: "module",
      config: {
        title: "List Modules",
        description:
          "List supported large-screen composition modules such as ChartPanel and FreeformModule. Use ChartPanel for chart-analysis panels; use FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components.",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async () => asToolContent(listModules()),
    },
    {
      name: "get_module_capability",
      category: "module",
      config: {
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
      handler: async (input) => {
        try {
          const moduleName = String(input.moduleName);
          return asToolContent(
            input.detail === "full"
              ? getModuleCapability(moduleName)
              : getCompactModuleCapability(moduleName),
          );
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_module_schema",
      category: "module",
      config: {
        title: "Generate Module Schema",
        description:
          "Generate editor component schemas from one explicit module input. Use ChartPanel for chart panels and FreeformModule for arbitrary mixed modules. Inputs should be LLM-designed slots, not prompt-only templates; layerRole controls content, decoration, and background ordering.",
        inputSchema: moduleInput,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          return asToolContent(sortComponentSchemas(generateModuleSchema(input)));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_module_tree_schema",
      category: "module",
      config: {
        title: "Generate Dashboard Module Tree Schema",
        description:
          "Generate one editor-ready __Group__ module tree from explicit module slots. Supports common grouping.mode='semantic' and grouping.singleChildGroup=true. Siblings are normalized and sorted by layerRole; SingleImage keeps imageLayerRole identical to layerRole.",
        inputSchema: moduleInput,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          const tree = generateModuleTreeSchema(input) as EditorTreeNode;
          return asToolContent(sortEditorTreeChildren(tree));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "validate_dashboard_spec",
      category: "dashboard",
      config: {
        title: "Validate Dashboard Spec",
        description:
          "Validate a LLM-authored DashboardSpec without generating a template. Use this after the LLM has decided theme, modules, explicit component groups, layout, components, optional grouping, and optional BIM/model reservedAreas. Every explicit group requires a specific business or visual-region title; generic labels such as 组件分组, 分组, or Group are rejected. Returns errors and warnings such as missing fields, invalid grouping mode, unpositioned explicit groups, invalid reserved areas, empty SvgDecoration placeholders, placeholder SingleText copy, missing chart data, missing ChartPanel auxiliaryTexts, too many ungrouped components, out-of-canvas modules, overlapping top-level regions, low text/background contrast, SingleText content that may overflow its declared box, empty left/right/bottom edge padding without custom SvgDecoration accents, or top-level regions overlapping reserved BIM model space.",
        inputSchema: dashboardSpecInput,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          return asToolContent(validateDashboardSpec(input));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_dashboard_schema",
      category: "dashboard",
      config: {
        title: "Generate Dashboard Schema",
        description:
          "Compile a complete LLM-authored DashboardSpec into one editor-ready __Group__ tree. The LLM must decide the theme, module list, explicit component groups, chart choices, layout coordinates, copy, backgrounds, decorations, edge-padding accents, optional grouping, and optional BIM/model reservedAreas before calling this tool. DashboardSpec.groups can wrap LLM-declared related components, but each explicit group must include a specific business/visual-region title and complete absolute style left/top/width/height; generic titles such as 组件分组, 分组, or Group are rejected. DashboardSpec.grouping is inherited by groups/modules that do not define their own grouping. DashboardSpec.reservedAreas with purpose/type/kind 'bim-model' are compile-time constraints only: they are validated for overlap, suppress automatic full-canvas background fallback, and are not emitted into the final schema. This tool compiles and validates the spec, rejects empty SvgDecoration placeholders, placeholder text, missing/demo chart data, and manual ChartPanel modules without auxiliaryTexts, warns about objective contrast, SingleText fit, and empty edge-padding issues, strips compile-time theme from output props, adds real SvgDecoration background carriers for bare groups/modules and bare canvas when no BIM/model reserved area exists, and does not infer a full-screen layout from a prompt or apply a fixed dashboard template.",
        inputSchema: dashboardSpecInput,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          return asToolContent(generateDashboardSchema(input));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "validate_dashboard_project_spec",
      category: "dashboard",
      config: {
        title: "Validate Dashboard Project Spec",
        description:
          "Validate a LLM-authored multi-page DashboardProjectSpec. Reusable master designs belong in masters; normal screens belong in pages and reference masters by masterLogicalIds. Every master and page is validated as a full DashboardSpec with the same structure, real-data, grouping, layout, contrast, text-fit, and visual-space quality rules used for an independent dashboard. Rejects duplicate document logicalIds, duplicate or unknown master references, masters referencing other masters, invalid nested DashboardSpecs, and pages with neither own content nor a master.",
        inputSchema: dashboardProjectSpecInput,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          return asToolContent(validateDashboardProjectSpec(input));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_dashboard_project_schema",
      category: "dashboard",
      config: {
        title: "Generate Dashboard Project Schema",
        description:
          "Compile a complete LLM-authored DashboardProjectSpec into an editor-ready project schema with documents. Every masters/pages item is a full DashboardSpec and must meet the same quality bar as an independently generated dashboard: complete information hierarchy, balanced content density, meaningful canvas usage, explicit absolute layout, real chart data and text, intentional groups/modules, readable contrast, sufficient text boxes, and LLM-authored backgrounds and decorations. Do not simplify pages, leave meaningless empty regions, or mechanically repeat one layout merely because the project contains multiple pages. Shared masters carry only reusable visual structure and must not replace page-specific business design. Each masters item becomes an independent pageType='master' document; each pages item becomes a pageType='page' document whose masterLogicalIds compile to Master reference nodes using the exact master document ids. Automatic full-canvas backgrounds are suppressed for masters and pages using masters so inherited layers cannot cover each other; author an explicit background component when needed. Normal pages are emitted first, and existing single-dashboard generation remains unchanged.",
        inputSchema: dashboardProjectSpecInput,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      handler: async (input) => {
        try {
          return asToolContent(generateDashboardProjectSchema(input));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
    {
      name: "generate_full_screen_from_prompt",
      category: "legacy",
      config: {
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
      handler: async (input) => {
        try {
          const tree = generateFullScreenFromPrompt(input) as EditorTreeNode;
          return asToolContent(sortEditorTreeChildren(tree));
        } catch (error) {
          return handleToolError(error);
        }
      },
    },
  ];
}

export function registerScreenTools(
  server: McpServer,
  options: ScreenServerOptions = {},
): void {
  for (const tool of getScreenToolDefinitions(options)) {
    server.registerTool(
      tool.name,
      tool.config,
      async (input: unknown) => tool.handler(input as JsonObject),
    );
  }
}

export function createScreenMcpServer(
  options: ScreenServerOptions = {},
): McpServer {
  const server = new McpServer(
    {
      name: "screen-component-mcp",
      version: SERVER_VERSION,
    },
    {
      instructions: SCREEN_MCP_INSTRUCTIONS,
    },
  );

  registerScreenTools(server, options);
  return server;
}
