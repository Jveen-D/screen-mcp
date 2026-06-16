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
const MCP_SERVER_COMMAND = NODE_PATH;
const MCP_SERVER_ARGS = ["node_modules/tsx/dist/cli.mjs", "src/server.ts"];

const INDICATOR_PROPS: JsonObject[] = [
  {
    componentName: "Indicator",
    logicalId: "indicator_today_orders",
    parentLogicalId: "indicator_group",
    name: "今日成交订单量",
    textValue: 12847,
    titleName: "今日成交订单量",
    titleVisible: true,
    globalConfig: {
      flexDirection: "column",
      alignItems: "center",
      space: 4,
    },
    numberStyle: {
      fontSize: 48,
      color: "#00E5FF",
      fontWeight: "bold",
    },
    separation: true,
    decimal: 0,
    style: {
      position: "absolute",
      left: 80,
      top: 80,
      width: 320,
      height: 100,
      backgroundColor: "rgba(17,61,110,0.68)",
      zIndex: 10,
    },
  },
  {
    componentName: "Gauge",
    logicalId: "gauge_device_load",
    parentLogicalId: "gauge_group",
    name: "设备负载率",
    value: 72,
    dialConfig: {
      graduationColor: "rgba(230,247,255,0.5)",
      pointerColor: "rgb(230,247,255)",
    },
    indicatorConfig: {
      minValue: 0,
      maxValue: 100,
      suffix: "%",
      valueColor: "#00E5FF",
    },
    ringRangeColor: [
      { startValue: 0, endValue: 0.33, color: "#1e90ff" },
      { startValue: 0.33, endValue: 0.66, color: "#2fe0e0" },
      { startValue: 0.66, endValue: 1, color: "#ff4d4f" },
    ],
    style: {
      position: "absolute",
      left: 440,
      top: 80,
      width: 360,
      height: 320,
      backgroundColor: "transparent",
      zIndex: 10,
    },
  },
  {
    componentName: "CircularProgress",
    logicalId: "circular_progress_completion",
    parentLogicalId: "progress_group",
    name: "部门完成度对比",
    data: [
      { name: "研发部", value: 78 },
      { name: "市场部", value: 45 },
      { name: "运营部", value: 92 },
    ],
    baseSeriesConfig: {
      suffix: "%",
      labelShowSeriesName: true,
    },
    legendConfig: {
      show: true,
      position: { top: "bottom", left: "center" },
    },
    style: {
      position: "absolute",
      left: 820,
      top: 80,
      width: 500,
      height: 300,
      backgroundColor: "transparent",
      zIndex: 10,
    },
  },
  {
    componentName: "PercentageBar",
    logicalId: "percentage_bar_budget",
    parentLogicalId: "budget_group",
    name: "年度预算执行进度",
    value: 68,
    max: 100,
    min: 0,
    globalConfig: {
      progressBarColor:
        "linear-gradient(90deg, rgba(24,213,255,1) 0%, rgba(0,102,255,1) 100%)",
      progressBarBackgroundColor: "rgba(255,255,255,0.1)",
    },
    tickStyle: {
      segmentCount: 5,
      suffix: { enable: true, text: "%" },
    },
    ratio: {
      suffix: { enable: true, text: "%" },
    },
    style: {
      position: "absolute",
      left: 80,
      top: 420,
      width: 760,
      height: 120,
      backgroundColor: "rgba(0,0,0,0)",
      zIndex: 10,
    },
  },
  {
    componentName: "SingleValueChart",
    logicalId: "single_value_overall",
    parentLogicalId: "overall_group",
    name: "整体任务完成率",
    percentValue: 83.5,
    ringColor:
      "linear-gradient(180deg, rgba(22,212,254,1) 0%, rgba(82,232,254,1) 100%)",
    TextStyle: {
      color: "#00E5FF",
      fontSize: 42,
      fontWeight: "bold",
      suffix: "%",
      textShadowisShow: true,
      textShadowColor: "rgba(0,229,255,0.6)",
      textShadowBlur: 10,
    },
    style: {
      position: "absolute",
      left: 880,
      top: 420,
      width: 240,
      height: 200,
      backgroundColor: "transparent",
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
  name: "screen-component-mcp-batch-client",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: MCP_SERVER_COMMAND,
  args: MCP_SERVER_ARGS,
  cwd: MCP_SERVER_CWD,
});

await client.connect(transport);

try {
  const tools = await client.listTools();
  const hasBatchTool = tools.tools.some((tool) => tool.name === "generate_components_schemas");
  if (!hasBatchTool) {
    throw new Error("MCP server does not expose generate_components_schemas");
  }

  console.log(`Batch generating schemas for ${INDICATOR_PROPS.length} indicator components...`);

  const result = await client.callTool({
    name: "generate_components_schemas",
    arguments: {
      componentsProps: INDICATOR_PROPS,
    },
  });

  const schemas = readToolJson(result);

  if (!Array.isArray(schemas)) {
    throw new Error("generate_components_schemas should return an array");
  }

  const outputDir = join(__dirname, "output");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "indicator-schemas.json");
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), "utf-8");

  console.log(`Generated ${schemas.length} schemas, saved to ${outputPath}`);
  for (const schema of schemas) {
    const schemaObj = schema as JsonObject;
    console.log(`  - ${schemaObj.componentName}: ${schemaObj.businessElementId}`);
  }
} finally {
  await client.close();
}
