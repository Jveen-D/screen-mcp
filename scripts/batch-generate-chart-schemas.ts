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

const CHART_PROPS: JsonObject[] = [
  {
    componentName: "FunnelChart",
    logicalId: "funnel_chart_demo",
    parentLogicalId: "chart_group",
    name: "转化漏斗图",
    data: [
      { name: "展现", value: 100 },
      { name: "点击", value: 80 },
      { name: "访问", value: 60 },
      { name: "咨询", value: 40 },
      { name: "订单", value: 20 },
    ],
    sort: "descending",
    style: {
      position: "absolute",
      left: 80,
      top: 160,
      width: 500,
      height: 300,
      zIndex: 10,
    },
  },
  {
    componentName: "RadarChart",
    logicalId: "radar_chart_demo",
    parentLogicalId: "chart_group",
    name: "能力雷达图",
    data: [
      { series: "团队A", dimension: "技术", value: 85 },
      { series: "团队A", dimension: "产品", value: 70 },
      { series: "团队A", dimension: "设计", value: 75 },
      { series: "团队A", dimension: "运营", value: 60 },
      { series: "团队B", dimension: "技术", value: 60 },
      { series: "团队B", dimension: "产品", value: 80 },
      { series: "团队B", dimension: "设计", value: 65 },
      { series: "团队B", dimension: "运营", value: 90 },
    ],
    max: 100,
    style: {
      position: "absolute",
      left: 620,
      top: 160,
      width: 520,
      height: 320,
      zIndex: 10,
    },
  },
  {
    componentName: "HeatMap",
    logicalId: "heat_map_demo",
    parentLogicalId: "chart_group",
    name: "时段热力图",
    data: [
      { x: "00:00", y: "周一", value: 5 },
      { x: "06:00", y: "周一", value: 12 },
      { x: "12:00", y: "周一", value: 28 },
      { x: "18:00", y: "周一", value: 22 },
      { x: "00:00", y: "周二", value: 8 },
      { x: "06:00", y: "周二", value: 18 },
      { x: "12:00", y: "周二", value: 35 },
      { x: "18:00", y: "周二", value: 26 },
      { x: "00:00", y: "周三", value: 6 },
      { x: "06:00", y: "周三", value: 15 },
      { x: "12:00", y: "周三", value: 30 },
      { x: "18:00", y: "周三", value: 24 },
    ],
    style: {
      position: "absolute",
      left: 80,
      top: 500,
      width: 450,
      height: 250,
      zIndex: 10,
    },
  },
  {
    componentName: "PictorialBarChart",
    logicalId: "pictorial_bar_chart_demo",
    parentLogicalId: "chart_group",
    name: "象形柱图",
    data: [
      { series: "销售额", type: "Q1", value: 120 },
      { series: "销售额", type: "Q2", value: 195 },
      { series: "销售额", type: "Q3", value: 60 },
      { series: "销售额", type: "Q4", value: 96 },
      { series: "销售额", type: "全年", value: 163 },
    ],
    style: {
      position: "absolute",
      left: 570,
      top: 500,
      width: 450,
      height: 250,
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
  name: "screen-component-mcp-chart-client",
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
      componentsProps: CHART_PROPS,
    },
  });

  const schemas = readToolJson(result);
  if (!Array.isArray(schemas)) {
    throw new Error("generate_components_schemas should return an array");
  }

  const outputDir = join(__dirname, "output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "chart-schemas.json");
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

  console.log(`Generated ${schemas.length} schemas, saved to ${outputPath}`);
  for (const schema of schemas) {
    const schemaObj = schema as JsonObject;
    console.log(`  - ${schemaObj.componentName}: ${schemaObj.businessElementId}`);
  }
} finally {
  await client.close();
}
