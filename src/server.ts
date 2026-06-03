import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  getModuleCapability,
  listModules,
} from "./core/modules.js";
import type { JsonObject } from "./types/component.js";

const server = new McpServer({
  name: "screen-component-mcp",
  version: "0.1.0",
});

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
      zIndex: z.number(),
    }).passthrough(),
    slots: z.record(z.unknown()),
  })
  .passthrough();

server.registerTool(
  "list_components",
  {
    title: "List Components",
    description: "Return summaries of supported screen components.",
  },
  async () => asToolContent(listComponents()),
);

server.registerTool(
  "get_component_capability",
  {
    title: "Get Component Capability",
    description: "Return the AI-readable capability map for a component.",
    inputSchema: {
      componentName: z.string().min(1),
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
      "Generate one complete editor component schema from one minimal AI props object.",
    inputSchema: aiComponentPropsInput,
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
      "Generate complete editor component schemas from an array of minimal AI props objects.",
    inputSchema: {
      componentsProps: z.array(aiComponentPropsInput),
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
    description: "Return summaries of supported component composition modules.",
  },
  async () => asToolContent(listModules()),
);

server.registerTool(
  "get_module_capability",
  {
    title: "Get Module Capability",
    description: "Return the AI-readable capability map for a composition module.",
    inputSchema: {
      moduleName: z.string().min(1),
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
      "Generate complete editor component schemas from one module composition input.",
    inputSchema: moduleInput,
  },
  async (input) => {
    try {
      return asToolContent(generateModuleSchema(input as JsonObject));
    } catch (error) {
      return handleToolError(error);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
