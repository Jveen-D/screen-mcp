import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import http from "node:http";
import url from "node:url";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
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
import type { JsonObject } from "./types/component.js";

const SERVER_VERSION = "0.1.0";
const RULES_VERSION = "2026-06-26.01-component-capability-cleanup";
const SERVER_STARTED_AT = new Date();
const SERVER_ENTRY_FILE = fileURLToPath(import.meta.url);

function createServer() {
  const server = new McpServer(
    {
      name: "screen-component-mcp",
      version: SERVER_VERSION,
    },
    {
      instructions:
        "This MCP server compiles large-screen/dashboard designs into editor schema. The LLM owns design decisions: theme colors, module list, chart choices, layout coordinates, copy, background, and decorations. For full-screen dashboards, first create a structured DashboardSpec, call validate_dashboard_spec, then call generate_dashboard_schema. Do not call generate_full_screen_from_prompt for production generation; it is disabled because prompt-only generation encourages fixed templates. Use ChartPanel for chart-analysis panels and FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components. Use DashboardSpec.groups for LLM-declared related top-level component regions such as headers, KPI rows, and custom mixed panels; every DashboardSpec.groups item must declare a complete absolute style left/top/width/height and should not be used as an unpositioned bucket. Do not flatten many unrelated elements into DashboardSpec.components. ChartPanel defaults to manual layout and only compiles slots explicitly provided by the LLM; DashboardSpec and direct module generation for manual ChartPanel must include slots.auxiliaryTexts with at least one real SingleText insight, side summary, center metric, or conclusion. Module/grouping is common: set grouping.mode='semantic' and grouping.singleChildGroup=true when you want semantic sections grouped; earlier siblings render above later siblings, so main content must be above decorations/background and background groups must stay last. __Group__ is only an editor grouping container and is not a visual background; module root groups may carry style only for editor positioning. DashboardSpec compilation adds real SvgDecoration background carriers for the full canvas and bare groups/modules when no explicit background carrier exists. DashboardSpec and direct chart component generation must carry real chartData.constant.data, or supported ChartPanel dataItems, and SingleText must carry real textContent; do not rely on demo categories or placeholder copy. Theme is compile-time context and is stripped from final component props. SvgDecoration decorations should use LLM-authored custom svgContent unless a non-empty preset id is explicitly chosen; MCP does not fall back to a default preset icon and rejects empty decoration placeholders in DashboardSpec. Do not guess or select existing project asset paths; use imageSrc only when the user explicitly provides a path. Hard constraints: Indicator width should be at least 280px and text lineHeight should be 1; Weather in a 1920x1080 header should be 280-300px wide; Gauge renders its own value, so do not overlay duplicate SingleText and set indicatorConfig.suffix correctly.",
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
      ],
      startedAt: SERVER_STARTED_AT.toISOString(),
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

  server.registerTool("get_server_diagnostics", { title: "Get Server Diagnostics", description: "Return the running MCP server process diagnostics.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(serverDiagnostics()));
  server.registerTool("list_components", { title: "List Components", description: "List supported large-screen editor components for dashboard schema generation.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(listComponents()));
  server.registerTool("get_component_capability", { title: "Get Component Capability", description: "Return an AI-readable component capability map. Defaults to compact; pass detail:'full' only when exact examples or full rule text are needed.", inputSchema: capabilityDetailInput, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ componentName, detail }) => { try { return asToolContent(detail === "full" ? getComponentCapability(componentName) : getCompactComponentCapability(componentName)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_components_schema", { title: "Generate Component Schema", description: "Generate one complete editor component schema from concise minimal AI props.", inputSchema: aiComponentPropsInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (props) => { try { return asToolContent(generateComponentsSchema(props as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_components_schemas", { title: "Generate Component Schemas", description: "Generate complete editor component schemas from concise minimal AI props.", inputSchema: { componentsProps: z.array(aiComponentPropsInput) }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async ({ componentsProps }) => { try { return asToolContent(generateComponentsSchemas(componentsProps as JsonObject[])); } catch (error) { return handleToolError(error); } });
  server.registerTool("list_modules", { title: "List Modules", description: "List supported large-screen composition modules such as ChartPanel and FreeformModule. Use ChartPanel for chart-analysis panels; use FreeformModule for KPI, table, map, media, control, or mixed modules composed from arbitrary explicit components.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(listModules()));
  server.registerTool("get_module_capability", { title: "Get Module Capability", description: "Return an AI-readable module capability map. Defaults to compact; pass detail:'full' only when exact examples or full rule text are needed.", inputSchema: moduleCapabilityDetailInput, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ moduleName, detail }) => { try { return asToolContent(detail === "full" ? getModuleCapability(moduleName) : getCompactModuleCapability(moduleName)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_module_schema", { title: "Generate Module Schema", description: "Generate component schemas from one explicit module input. Use ChartPanel for chart panels and FreeformModule for arbitrary mixed modules.", inputSchema: moduleInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateModuleSchema(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_module_tree_schema", { title: "Generate Dashboard Module Tree Schema", description: "Generate one editor-ready __Group__ module tree from explicit module slots. Supports common semantic grouping and bottom-layer SingleImage sorting.", inputSchema: moduleInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateModuleTreeSchema(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("validate_dashboard_spec", { title: "Validate Dashboard Spec", description: "Validate a LLM-authored DashboardSpec without generating a template. Use this after the LLM has decided theme, modules, explicit component groups, layout, components, and optional grouping. Reports unpositioned explicit groups, empty SvgDecoration placeholders, placeholder text, missing/demo chart data, and missing ChartPanel auxiliaryTexts.", inputSchema: dashboardSpecInput, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(validateDashboardSpec(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_dashboard_schema", { title: "Generate Dashboard Schema", description: "Compile a complete LLM-authored DashboardSpec into one editor-ready __Group__ tree. DashboardSpec.groups can wrap LLM-declared related components, but each explicit group must include complete absolute style left/top/width/height; DashboardSpec.grouping is inherited by groups/modules that do not define their own grouping. This tool compiles and validates the spec, rejects empty SvgDecoration placeholders, placeholder text, missing/demo chart data, and manual ChartPanel modules without auxiliaryTexts, strips compile-time theme from output props, adds real SvgDecoration background carriers for bare canvas/groups/modules, and does not infer a full-screen layout from a prompt or apply a fixed dashboard template.", inputSchema: dashboardSpecInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateDashboardSchema(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_full_screen_from_prompt", { title: "Generate Full Screen Dashboard From Prompt", description: "Disabled for production generation because prompt-only full-screen generation encourages fixed templates. Create a DashboardSpec with LLM-chosen theme, modules, layout, and slots, then call generate_dashboard_schema.", inputSchema: fullScreenPromptInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateFullScreenFromPrompt(input as JsonObject)); } catch (error) { return handleToolError(error); } });

  return server;
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3460;

interface Session {
  transport: SSEServerTransport;
  server: McpServer;
}

const sessions = new Map<string, Session>();

const httpServer = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || "", true);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (parsed.pathname === "/sse") {
    const transport = new SSEServerTransport("/message", res);
    const server = createServer();
    sessions.set(transport.sessionId, { transport, server });
    transport.onclose = () => {
      sessions.delete(transport.sessionId);
    };
    req.on("close", () => {
      sessions.delete(transport.sessionId);
    });
    await server.connect(transport);
    return;
  }

  if (parsed.pathname === "/message") {
    const sessionId = parsed.query.sessionId as string | undefined;
    if (!sessionId) {
      res.writeHead(400);
      res.end("Missing sessionId");
      return;
    }
    const session = sessions.get(sessionId);
    if (!session) {
      res.writeHead(404);
      res.end("Session not found");
      return;
    }
    await session.transport.handlePostMessage(req, res);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  console.log(`Screen MCP HTTP server running at http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down Screen MCP HTTP server...");
  for (const [sessionId, session] of sessions) {
    try {
      await session.transport.close();
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  sessions.clear();
  httpServer.close(() => {
    console.log("Server shutdown complete");
    process.exit(0);
  });
});
