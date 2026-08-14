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
  const pieRuntimeBinding = mcpCapability.runtimeDataBinding as JsonObject;
  assert.deepEqual(
    pieRuntimeBinding.mode,
    "chartData",
    "MCP capability should publish the chart runtime data-binding contract",
  );
  assert.equal(
    pieRuntimeBinding.staticDataPath,
    "props.chartData.constant.data",
    "MCP capability should publish the chart static-data path",
  );
  assert.deepEqual(
    pieRuntimeBinding.sourceTypes,
    ["constant", "api", "dataSet", "form"],
    "MCP capability should publish the supported chart runtime data sources",
  );
  const pieStaticContract = pieRuntimeBinding.staticDataContract as JsonObject;
  assert.equal(
    pieStaticContract.fieldNameMustMatchDataKeys,
    true,
    "chartData capability should require dimension and indicator field names to match row keys",
  );
  assert.deepEqual(
    pieStaticContract.calculateTypePaths,
    [
      "props.chartData.dimension[].fieldDataConfig.calculateType",
      "props.chartData.indicator[].fieldDataConfig.calculateType",
    ],
    "chartData capability should publish both aggregation paths",
  );
  const pieApiContract = pieRuntimeBinding.apiContract as JsonObject;
  assert.deepEqual(
    pieApiContract.requestConfigurationPaths,
    [
      "props.chartData.api.requestParam",
      "props.chartData.api.requestBody",
      "props.chartData.api.headers",
      "props.chartData.api.fieldList",
      "props.chartData.api.processFunction",
    ],
    "chartData capability should publish the complete API request contract",
  );
  const piePollingContract = pieRuntimeBinding.pollingContract as JsonObject;
  assert.equal(piePollingContract.intervalUnit, "seconds");
  assert.equal(piePollingContract.runtimeCondition, "designMode === 'live'");
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

  const singleTextCapabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "SingleText" },
  });
  const singleTextCapability = readToolJson(singleTextCapabilityResult);
  const textRuntimeBinding = singleTextCapability.runtimeDataBinding as JsonObject;
  assert.equal(
    textRuntimeBinding.mode,
    "datasource",
    "SingleText should publish its datasource runtime contract",
  );
  assert.equal(
    textRuntimeBinding.defaultSourceType,
    "externalConstant",
    "SingleText should explain that its default runtime value comes from component props",
  );
  assert.deepEqual(
    textRuntimeBinding.pollingPaths,
    ["props.datasource.autoRefresh", "props.datasource.refreshInterval"],
    "MCP capability should publish the datasource runtime polling paths",
  );
  assert.deepEqual(
    textRuntimeBinding.unsupportedSourceTypes,
    ["dataSet"],
    "datasource capability should mark the disabled dataSet option",
  );
  const textSourceTypes = textRuntimeBinding.sourceTypeSemantics as JsonObject;
  assert.equal(
    (textSourceTypes.externalConstant as JsonObject).dataPath,
    "props",
    "externalConstant should resolve values from component props",
  );
  assert.equal(
    (textSourceTypes.externalConstant as JsonObject).alsoWhenSourceTypeMissing,
    true,
    "missing datasource sourceType should follow externalConstant semantics",
  );
  const textStaticContract = textRuntimeBinding.staticDataContract as JsonObject;
  assert.equal(textStaticContract.mapFieldsCardinality, 1);
  assert.deepEqual(textStaticContract.tableColumnTypes, ["string", "number"]);
  assert.equal(textStaticContract.leadingArrayIndexIsIgnored, true);
  assert.equal(textStaticContract.constantIgnoresDataFieldPath, true);
  const textApiContract = textRuntimeBinding.apiContract as JsonObject;
  assert.equal(textApiContract.projectApiListPath, "datasource.apiList[].id");
  assert.equal(textApiContract.responseDataPathResolver, "lodash.get");
  assert.equal(textApiContract.wrapsNonArrayResult, true);
  assert.equal(
    (textApiContract.designMode as JsonObject).sendsRequests,
    false,
    "datasource capability should explain that design mode does not send real requests",
  );
  const textPollingContract = textRuntimeBinding.pollingContract as JsonObject;
  assert.equal(textPollingContract.intervalUnit, "seconds");
  assert.equal(textPollingContract.requiresSourceType, "api");

  const percentageCapabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "PercentageBar" },
  });
  const percentageCapability = readToolJson(percentageCapabilityResult);
  const percentageRuntimeBinding = percentageCapability.runtimeDataBinding as JsonObject;
  assert.deepEqual(
    percentageRuntimeBinding.fieldMappingKeys,
    ["value", "max", "min"],
    "MCP capability should expose datasource field mapping keys from the component defaults",
  );

  const polygonCapabilityResult = await client.callTool({
    name: "get_component_capability",
    arguments: { componentName: "GaodeMap-Polygon" },
  });
  const polygonCapability = readToolJson(polygonCapabilityResult);
  assert.equal(
    (polygonCapability.runtimeDataBinding as JsonObject).mode,
    "componentProps",
    "a component-owned datasource field without sourceType must not be mistaken for the shared datasource protocol",
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
