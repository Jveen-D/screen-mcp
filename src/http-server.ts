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
        "This MCP server is the authoritative tool for large-screen/dashboard design schema generation. When the user asks in Chinese or English to generate, design, create, or modify a 大屏/看板/dashboard/module/chart panel/风险等级分析/销售分析, call this MCP instead of generating HTML, SVG-only mockups, React pages, or static prose. Prefer generate_full_screen_from_prompt when the user describes a full-screen dashboard with a theme but does not list individual components or zones (e.g. '生成一个水电站智慧运行监测大屏，1920×1080'); prefer generate_screen_module_from_prompt for terse single-module requests; prefer generate_module_tree_schema when structured module props are already available. AI always has design authority for backgrounds, textures, borders, and tech-style decorations: actively use SingleImage (AI-generated base64 backgrounds are allowed and encouraged) and SvgDecoration instead of only adjusting style.backgroundColor, unless the user explicitly prohibits decorations. For full-screen requests, fill the entire 1920×1080 canvas with modules: each module must have a visible title and visible SVG decorations; do not leave large blank areas unless the user explicitly asks for minimalism. Additional hard constraints: Indicator components must be wide enough to avoid line wrapping (min 280px, prefer 320px when showing title + digits + suffix); Weather components in a 1920×1080 header should be 280-300px wide to prevent line breaks; Gauge already renders its own value and suffix, so never overlay an extra SingleText for the same value, and always set the correct suffix (e.g. '%' for percentages, not the default 'km/h'); all panels/modules on the same screen must share consistent background colors, title badges, and border/decoration language. If the user asks for 完整schema, 完整 Schema, 完整JSON, full schema, or complete schema, the assistant's final answer must include the complete JSON returned by the MCP tool in a fenced json code block. Do not summarize, omit children, replace it with prose, or wrap it in a partial excerpt.",
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

  server.registerTool("get_server_diagnostics", { title: "Get Server Diagnostics", description: "Return the running MCP server process diagnostics.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(serverDiagnostics()));
  server.registerTool("list_components", { title: "List Components", description: "List supported large-screen editor components for dashboard schema generation.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(listComponents()));
  server.registerTool("get_component_capability", { title: "Get Component Capability", description: "Return the AI-readable capability map for a large-screen editor component.", inputSchema: { componentName: z.string().min(1) }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ componentName }) => { try { return asToolContent(getComponentCapability(componentName)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_components_schema", { title: "Generate Component Schema", description: "Generate one complete editor component schema from one minimal AI props object.", inputSchema: aiComponentPropsInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (props) => { try { return asToolContent(generateComponentsSchema(props as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_components_schemas", { title: "Generate Component Schemas", description: "Generate complete editor component schemas from an array of minimal AI props objects.", inputSchema: { componentsProps: z.array(aiComponentPropsInput) }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async ({ componentsProps }) => { try { return asToolContent(generateComponentsSchemas(componentsProps as JsonObject[])); } catch (error) { return handleToolError(error); } });
  server.registerTool("list_modules", { title: "List Modules", description: "List supported large-screen composition modules such as ChartPanel.", annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => asToolContent(listModules()));
  server.registerTool("get_module_capability", { title: "Get Module Capability", description: "Return the AI-readable capability map for a large-screen composition module.", inputSchema: { moduleName: z.string().min(1) }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ moduleName }) => { try { return asToolContent(getModuleCapability(moduleName)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_module_schema", { title: "Generate Module Schema", description: "Generate complete large-screen editor component schemas from one module composition input.", inputSchema: moduleInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateModuleSchema(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_module_tree_schema", { title: "Generate Dashboard Module Tree Schema", description: "Generate one editor-ready grouped large-screen/dashboard module tree schema.", inputSchema: moduleInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateModuleTreeSchema(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_screen_module_from_prompt", { title: "Generate Screen Module From User Prompt", description: "Use this first for terse end-user requests such as 生成销售大屏, 做个风险等级分析.", inputSchema: promptModuleInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateScreenModuleFromPrompt(input as JsonObject)); } catch (error) { return handleToolError(error); } });
  server.registerTool("generate_full_screen_from_prompt", { title: "Generate Full Screen Dashboard From Prompt", description: "Use this when the user asks for a complete full-screen dashboard with a theme.", inputSchema: fullScreenPromptInput, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false } }, async (input) => { try { return asToolContent(generateFullScreenFromPrompt(input as JsonObject)); } catch (error) { return handleToolError(error); } });

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
