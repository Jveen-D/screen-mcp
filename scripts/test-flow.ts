import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { getComponentCapability, listComponents } from "../src/core/registry.js";
import { generateComponentsSchema } from "../src/core/schema.js";
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
const series = option.series as JsonObject[];
const firstSeries = series[0] as JsonObject;
const inputOption = aiProps.option as JsonObject;
const inputSeries = inputOption.series as JsonObject[];
const inputFirstSeries = inputSeries[0] as JsonObject;
const chartData = props.chartData as JsonObject;

assert.equal(schema.componentName, "PieChart");
assert.equal(chartData.sourceType, "constant");
assert.equal("title" in option, false);
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
} finally {
  await client.close();
}

console.log("test-flow passed");
