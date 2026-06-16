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

const TABLE_PROPS: JsonObject[] = [
  {
    componentName: "BaseTable",
    logicalId: "base_table_demo",
    parentLogicalId: "table_group",
    name: "区域销售基础表格",
    columns: [
      { field: "region", label: "区域" },
      { field: "sales", label: "销售额", type: "number" },
      { field: "status", label: "状态" },
    ],
    data: [
      { region: "北京", sales: 1200, status: "达标" },
      { region: "上海", sales: 980, status: "达标" },
      { region: "广州", sales: 720, status: "未达标" },
      { region: "深圳", sales: 1350, status: "超预期" },
    ],
    style: {
      position: "absolute",
      left: 80,
      top: 160,
      width: 520,
      height: 280,
      zIndex: 10,
    },
  },
  {
    componentName: "ScrollList",
    logicalId: "scroll_list_demo",
    parentLogicalId: "list_group",
    name: "区域完成率滚动表格",
    columns: [
      { field: "region", label: "区域" },
      { field: "rate", label: "完成率" },
      { field: "status", label: "完成情况" },
    ],
    data: [
      { region: "北京", rate: 87.2, status: "超预期" },
      { region: "上海", rate: 80.5, status: "达标" },
      { region: "杭州", rate: 72.3, status: "达标" },
      { region: "重庆", rate: 65.5, status: "未达标" },
      { region: "成都", rate: 58.4, status: "未达标" },
    ],
    animateProps: {
      animate: true,
      animationType: "rowScroll",
      direction: "bottom2Top",
      interval: 1,
      duration: 2,
    },
    style: {
      position: "absolute",
      left: 640,
      top: 160,
      width: 397,
      height: 234,
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
  name: "screen-component-mcp-table-client",
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
      componentsProps: TABLE_PROPS,
    },
  });

  const schemas = readToolJson(result);
  if (!Array.isArray(schemas)) {
    throw new Error("generate_components_schemas should return an array");
  }

  const outputDir = join(__dirname, "output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "table-schemas.json");
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

  console.log(`Generated ${schemas.length} schemas, saved to ${outputPath}`);
  for (const schema of schemas) {
    const schemaObj = schema as JsonObject;
    console.log(`  - ${schemaObj.componentName}: ${schemaObj.businessElementId}`);
  }
} finally {
  await client.close();
}
