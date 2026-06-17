import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { JsonObject } from "../src/types/component.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_SERVER_CWD = join(__dirname, "..");
const MCP_SERVER_CWD = process.env.MCP_SERVER_CWD || DEFAULT_SERVER_CWD;
const NODE_PATH = process.execPath;

const BASE_PROPS: JsonObject[] = [
  {
    componentName: "NavMenu",
    logicalId: "nav_menu_demo",
    parentLogicalId: "menu_group",
    name: "侧边导航",
    menuData: {
      items: [
        { id: "1", name: "总览" },
        { id: "2", name: "安全" },
        { id: "3", name: "质量" },
        { id: "4", name: "进度" },
      ],
    },
    style: {
      position: "absolute",
      left: 80,
      top: 120,
      width: 280,
      height: 600,
      zIndex: 10,
    },
  },
  {
    componentName: "TabMenu",
    logicalId: "tab_menu_demo",
    parentLogicalId: "menu_group",
    name: "顶部 Tab",
    menuData: {
      items: [
        { id: "1", name: "驾驶舱" },
        { id: "2", name: "安全看板" },
        { id: "3", name: "质量看板" },
      ],
    },
    flexDirection: "row",
    alignType: "center",
    style: {
      position: "absolute",
      left: 300,
      top: 80,
      width: 600,
      height: 60,
      zIndex: 10,
    },
  },
  {
    componentName: "Input",
    logicalId: "input_demo",
    parentLogicalId: "form_group",
    name: "搜索输入框",
    placeholder: "请输入关键词",
    style: {
      position: "absolute",
      left: 100,
      top: 100,
      width: 240,
      height: 40,
      zIndex: 10,
    },
  },
];

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>): JsonObject {
  if (!Array.isArray(result.content)) {
    throw new Error("MCP tool should return content array");
  }
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("MCP tool should return text content");
  }
  const text = "text" in content ? content.text : "";
  return JSON.parse(text) as JsonObject;
}

const client = new Client({
  name: "screen-component-mcp-base-client",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: NODE_PATH,
  args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
  cwd: MCP_SERVER_CWD,
});

await client.connect(transport);

try {
  const result = await client.callTool({
    name: "generate_components_schemas",
    arguments: {
      componentsProps: BASE_PROPS,
    },
  });

  const schemas = readToolJson(result);
  if (!Array.isArray(schemas)) {
    throw new Error("generate_components_schemas should return an array");
  }

  const outputDir = join(__dirname, "output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "base-schemas.json");
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

  console.log(`Generated ${schemas.length} schemas, saved to ${outputPath}`);
  for (const schema of schemas) {
    const schemaObj = schema as JsonObject;
    console.log(`  - ${schemaObj.componentName}: ${schemaObj.businessElementId}`);
  }
} finally {
  await client.close();
}
