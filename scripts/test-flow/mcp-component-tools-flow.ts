import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpComponentToolTests({
  client,
  aiProps,
  inputFirstSeries,
  imageProps,
  textProps,
  svgProps,
}: McpToolContext): Promise<void> {
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
  assert.equal(mcpCapability.compact, true, "MCP capability should default to compact mode");
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
  assert.equal(
    Array.isArray(mcpCapability.examples),
    false,
    "compact MCP capability should omit examples for speed",
  );
  assert.ok(
    typeof mcpCapability.exampleCount === "number" && mcpCapability.exampleCount > 0,
    "compact MCP capability should expose omitted example count",
  );
  const writableProps = mcpCapability.aiWritableProps as JsonObject[];
  const legendCapability = writableProps.find(
    (item) => item.path === "option.legend",
  ) as JsonObject | undefined;
  assert.ok(legendCapability, "MCP capability should describe option.legend");
  assert.ok(
    legendCapability.positionRules,
    "MCP capability should describe legend position rules",
  );
  const fullCapabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "PieChart", detail: "full" },
  });
  const fullMcpCapability = readToolJson(fullCapabilityResult);
  assert.ok(
    Array.isArray(fullMcpCapability.examples),
    "MCP full capability should include examples when requested",
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
      componentsProps: [imageProps, textProps, aiProps, svgProps],
    },
  });
  assert.equal(schemasResult.isError, undefined);
  const toolSchemas = readToolJson(schemasResult);
  assert.equal(toolSchemas.length, 4);
  assert.deepEqual(
    toolSchemas.map((item: JsonObject) => item.componentName),
    ["SingleText", "PieChart", "SvgDecoration", "SingleImage"],
    "MCP batch component generation should place images below text, charts, and icons",
  );
}
