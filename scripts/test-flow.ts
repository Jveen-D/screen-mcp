import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { getComponentCapability, listComponents } from "../src/core/registry.js";
import {
  generateComponentsSchema,
  generateComponentsSchemas,
} from "../src/core/schema.js";
import type { JsonObject } from "../src/types/component.js";

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>) {
  assert.ok(Array.isArray(result.content), "MCP tool should return content");
  const content = result.content[0];
  assert.ok(
    content && content.type === "text",
    "MCP tool should return JSON text content",
  );

  const text = "text" in content ? content.text : "";
  assert.equal(typeof text, "string");

  return JSON.parse(text);
}

const components = listComponents();
assert.ok(
  components.some((component) => component.componentName === "PieChart"),
  "list_components should include PieChart",
);
assert.ok(
  components.some((component) => component.componentName === "SingleImage"),
  "list_components should include SingleImage",
);
assert.ok(
  components.some((component) => component.componentName === "SingleText"),
  "list_components should include SingleText",
);
assert.ok(
  components.some((component) => component.componentName === "SvgDecoration"),
  "list_components should include SvgDecoration",
);

const capability = getComponentCapability("PieChart");
assert.ok(Array.isArray(capability.requiredProps), "capability has requiredProps");
assert.ok(
  Array.isArray(capability.aiWritableProps),
  "capability has aiWritableProps",
);
assert.ok(
  Array.isArray(capability.aiForbiddenProps),
  "capability has aiForbiddenProps",
);
assert.ok(Array.isArray(capability.examples), "capability has examples");

const examples = capability.examples as JsonObject[];
const firstExample = examples[0];
assert.ok(firstExample, "capability should include at least one example");

const aiProps = firstExample.props as JsonObject;
const schema = generateComponentsSchema(aiProps);
const props = schema.props;
const option = props.option as JsonObject;
const legend = option.legend as JsonObject;
const series = option.series as JsonObject[];
const firstSeries = series[0] as JsonObject;
const inputOption = aiProps.option as JsonObject;
const inputSeries = inputOption.series as JsonObject[];
const inputFirstSeries = inputSeries[0] as JsonObject;
const chartData = props.chartData as JsonObject;

assert.equal(schema.componentName, "PieChart");
assert.equal(chartData.sourceType, "constant");
assert.equal("title" in option, false);
assert.equal(legend.left, "center");
assert.equal(legend.top, "bottom");
assert.equal(firstSeries.type, "pie");
assert.deepEqual(firstSeries.radius, inputFirstSeries.radius);
assert.equal(schema.businessElementId, aiProps.logicalId);
assert.equal(schema.parentBusinessElementId, aiProps.parentLogicalId);

const forbiddenOverrideSchema = generateComponentsSchema({
  ...aiProps,
  chartData: {
    sourceType: "api",
  },
  eventConfigures: [{ eventName: "click" }],
  option: {
    title: {
      text: "AI should not write title",
    },
    series: [
      {
        data: [{ name: "AI should not write data", value: 999 }],
        radius: ["50%", "72%"],
      },
    ],
  },
});
const forbiddenOverrideOption = forbiddenOverrideSchema.props.option as JsonObject;
const forbiddenOverrideSeries = forbiddenOverrideOption.series as JsonObject[];
const forbiddenOverrideFirstSeries = forbiddenOverrideSeries[0] as JsonObject;
const forbiddenOverrideChartData =
  forbiddenOverrideSchema.props.chartData as JsonObject;
assert.equal(forbiddenOverrideChartData.sourceType, "constant");
assert.equal("title" in forbiddenOverrideOption, false);
assert.equal("data" in forbiddenOverrideFirstSeries, false);
assert.deepEqual(forbiddenOverrideFirstSeries.radius, ["50%", "72%"]);
assert.deepEqual(forbiddenOverrideSchema.props.eventConfigures, []);

const invalidLegendSchema = generateComponentsSchema({
  ...aiProps,
  option: {
    legend: {
      left: "center",
      top: "center",
    },
  },
});
const invalidLegendOption = invalidLegendSchema.props.option as JsonObject;
const normalizedLegend = invalidLegendOption.legend as JsonObject;
assert.equal(normalizedLegend.left, "center");
assert.equal(normalizedLegend.top, "top");

const imageCapability = getComponentCapability("SingleImage");
assert.ok(Array.isArray(imageCapability.aiWritableProps));
const imageSchema = generateComponentsSchema({
  componentName: "SingleImage",
  logicalId: "panel_bg_image",
  parentLogicalId: "sales_group",
  name: "销售面板背景",
  style: {
    position: "absolute",
    left: 48,
    top: 96,
    width: 520,
    height: 360,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 0,
    zIndex: 1,
  },
  imageBase64: "data:image/png;base64,AAAA",
  targetUrl: "https://example.com",
  openBrowser: true,
});
assert.equal(imageSchema.componentName, "SingleImage");
assert.equal(imageSchema.props.imageBase64, "data:image/png;base64,AAAA");
assert.equal(imageSchema.props.targetUrl, "");
assert.equal(imageSchema.props.openBrowser, false);

const textCapability = getComponentCapability("SingleText");
assert.ok(Array.isArray(textCapability.aiForbiddenProps));
const textSchema = generateComponentsSchema({
  componentName: "SingleText",
  logicalId: "sales_panel_title",
  parentLogicalId: "sales_group",
  name: "销售面板标题",
  textContent: "销售渠道占比",
  datasource: {
    sourceType: "api",
  },
  style: {
    position: "absolute",
    left: 80,
    top: 112,
    width: 260,
    height: 36,
    fontSize: 22,
    color: "#DFF8FF",
    textAlign: "left",
    backgroundColor: "rgba(0,0,0,0)",
    fontWeight: "bold",
    zIndex: 20,
  },
});
const textDatasource = textSchema.props.datasource as JsonObject;
const textConstantData = textDatasource.constantData as JsonObject[];
assert.equal(textSchema.componentName, "SingleText");
assert.equal(textSchema.props.textContent, "销售渠道占比");
assert.equal(textDatasource.sourceType, "externalConstant");
assert.equal(textConstantData[0]?.text, "销售渠道占比");

const svgCapability = getComponentCapability("SvgDecoration");
assert.ok(Array.isArray(svgCapability.aiWritableProps));
const safeSvg =
  '<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 L100 0" stroke="#00E5FF" fill="none"/></svg>';
const svgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "panel_corner_svg",
  parentLogicalId: "sales_group",
  name: "右上角科技装饰",
  style: {
    width: 120,
    height: 64,
    position: "absolute",
    left: 448,
    top: 96,
    backgroundColor: "rgba(0,0,0,0)",
    zIndex: 30,
  },
  svgSource: "custom",
  svgContent: safeSvg,
  primaryColor: "#00E5FF",
  glow: {
    isActive: true,
    color: "rgba(0,229,255,0.55)",
    blur: 8,
  },
});
assert.equal(svgSchema.componentName, "SvgDecoration");
assert.equal(svgSchema.props.svgSource, "custom");
assert.equal(svgSchema.props.svgContent, safeSvg);

const unsafeSvgSchema = generateComponentsSchema({
  componentName: "SvgDecoration",
  logicalId: "unsafe_svg",
  parentLogicalId: "sales_group",
  style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  svgSource: "custom",
  svgContent: "<svg><script>alert(1)</script></svg>",
});
assert.equal(unsafeSvgSchema.props.svgSource, "preset");

const panelSchemas = generateComponentsSchemas([
  imageSchema.props,
  textSchema.props,
  aiProps,
  svgSchema.props,
]);
assert.equal(panelSchemas.length, 4);
assert.deepEqual(
  panelSchemas.map((item) => item.indexNum),
  [1, 2, 3, 4],
);

const nodePath = process.execPath;
const client = new Client({
  name: "screen-component-mcp-test-client",
  version: "0.1.0",
});
const transport = new StdioClientTransport({
  command: nodePath,
  args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
});

await client.connect(transport);

try {
  const tools = await client.listTools();
  assert.ok(
    tools.tools.some((tool) => tool.name === "list_components"),
    "MCP server should expose list_components",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_component_capability"),
    "MCP server should expose get_component_capability",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_components_schema"),
    "MCP server should expose generate_components_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_components_schemas"),
    "MCP server should expose generate_components_schemas",
  );

  const listResult = await client.callTool({
    name: "list_components",
    arguments: {},
  });
  const listedComponents = readToolJson(listResult);
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "PieChart",
    ),
    "MCP list_components should include PieChart",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SingleImage",
    ),
    "MCP list_components should include SingleImage",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SingleText",
    ),
    "MCP list_components should include SingleText",
  );
  assert.ok(
    listedComponents.some(
      (component: JsonObject) => component.componentName === "SvgDecoration",
    ),
    "MCP list_components should include SvgDecoration",
  );

  const capabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "PieChart" },
  });
  const mcpCapability = readToolJson(capabilityResult);
  assert.ok(
    Array.isArray(mcpCapability.requiredProps),
    "MCP capability has requiredProps",
  );
  assert.ok(
    Array.isArray(mcpCapability.aiWritableProps),
    "MCP capability has aiWritableProps",
  );
  assert.ok(
    Array.isArray(mcpCapability.aiForbiddenProps),
    "MCP capability has aiForbiddenProps",
  );
  assert.ok(Array.isArray(mcpCapability.examples), "MCP capability has examples");
  const writableProps = mcpCapability.aiWritableProps as JsonObject[];
  const legendCapability = writableProps.find(
    (item) => item.path === "option.legend",
  ) as JsonObject | undefined;
  assert.ok(legendCapability, "MCP capability should describe option.legend");
  assert.ok(
    legendCapability.positionRules,
    "MCP capability should describe legend position rules",
  );

  const toolResult = await client.callTool({
    name: "generate_components_schema",
    arguments: aiProps,
  });
  assert.equal(toolResult.isError, undefined);
  const toolSchema = readToolJson(toolResult);
  assert.equal(toolSchema.props.chartData.sourceType, "constant");
  assert.equal("title" in toolSchema.props.option, false);
  assert.equal(toolSchema.props.option.series[0].type, "pie");
  assert.deepEqual(toolSchema.props.option.series[0].radius, inputFirstSeries.radius);

  const schemasResult = await client.callTool({
    name: "generate_components_schemas",
    arguments: {
      componentsProps: [imageSchema.props, textSchema.props, aiProps, svgSchema.props],
    },
  });
  assert.equal(schemasResult.isError, undefined);
  const toolSchemas = readToolJson(schemasResult);
  assert.equal(toolSchemas.length, 4);
  assert.equal(toolSchemas[0].componentName, "SingleImage");
  assert.equal(toolSchemas[1].componentName, "SingleText");
  assert.equal(toolSchemas[2].componentName, "PieChart");
  assert.equal(toolSchemas[3].componentName, "SvgDecoration");
} finally {
  await client.close();
}

console.log("test-flow passed");
