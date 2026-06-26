import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { hasPropName, readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpModuleToolTests({
  client,
  chartPanelInput,
  freeformModuleInput,
}: McpToolContext): Promise<void> {
  const moduleListResult = await client.callTool({
    name: "list_modules",
    arguments: {},
  });
  const listedModules = readToolJson(moduleListResult);
  assert.ok(
    listedModules.some(
      (moduleItem: JsonObject) => moduleItem.moduleName === "ChartPanel",
    ),
    "MCP list_modules should include ChartPanel",
  );
  assert.ok(
    listedModules.some(
      (moduleItem: JsonObject) => moduleItem.moduleName === "FreeformModule",
    ),
    "MCP list_modules should include FreeformModule",
  );

  const moduleCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "ChartPanel" },
  });
  const mcpModuleCapability = readToolJson(moduleCapabilityResult);
  assert.equal(
    mcpModuleCapability.compact,
    true,
    "MCP module capability should default to compact mode",
  );
  assert.ok(mcpModuleCapability.slots, "MCP module capability should include slots");
  assert.equal(
    (mcpModuleCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );
  assert.equal(
    Array.isArray(mcpModuleCapability.layoutRules),
    false,
    "compact MCP module capability should omit full layoutRules for speed",
  );
  assert.ok(
    Array.isArray(mcpModuleCapability.layoutRuleGroups),
    "compact MCP module capability should retain layout rule group summaries",
  );
  const fullModuleCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "ChartPanel", detail: "full" },
  });
  const fullMcpModuleCapability = readToolJson(fullModuleCapabilityResult);
  assert.ok(
    Array.isArray(fullMcpModuleCapability.layoutRules),
    "MCP full module capability should include full layoutRules when requested",
  );
  const freeformCapabilityResult = await client.callTool({
    name: "get_module_capability",
    arguments: { moduleName: "FreeformModule" },
  });
  const mcpFreeformCapability = readToolJson(freeformCapabilityResult);
  assert.ok(mcpFreeformCapability.slots, "MCP FreeformModule capability should include slots");
  assert.equal(
    (mcpFreeformCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );

  const moduleSchemaResult = await client.callTool({
    name: "generate_module_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleSchemaResult.isError, undefined);
  const toolModuleSchemas = readToolJson(moduleSchemaResult);
  assert.equal(toolModuleSchemas.length, 5);
  assert.equal(toolModuleSchemas[0].componentName, "SingleText");
  assert.equal(toolModuleSchemas[1].componentName, "SingleText");
  assert.equal(toolModuleSchemas[2].componentName, "PieChart");
  assert.equal(toolModuleSchemas[3].componentName, "SvgDecoration");
  assert.equal(toolModuleSchemas[4].componentName, "SingleImage");
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要容器")),
    false,
    "MCP tool should not synthesize side summary decoration templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "侧边摘要分隔线")),
    false,
    "MCP tool should not synthesize side summary row-rule decoration templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "主图侧卡关联线")),
    false,
    "MCP tool should not synthesize chart-to-side-card connector templates",
  );
  assert.equal(
    toolModuleSchemas.some((item: JsonObject) => hasPropName(item, "底部结构线")),
    false,
    "MCP tool should not synthesize bottom structure decoration templates",
  );

  const moduleTreeSchemaResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: chartPanelInput,
  });
  assert.equal(moduleTreeSchemaResult.isError, undefined);
  const toolModuleTreeSchema = readToolJson(moduleTreeSchemaResult);
  assert.equal(toolModuleTreeSchema.componentName, "__Group__");
  assert.equal(toolModuleTreeSchema.structVersion, "0.0.0");
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).left, 48);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).top, 96);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).width, 520);
  assert.equal((toolModuleTreeSchema.props.style as JsonObject).height, 360);
  assert.equal(toolModuleTreeSchema.children.length, 5);
  assert.equal(toolModuleTreeSchema.children[2].componentName, "PieChart");
  assert.equal(toolModuleTreeSchema.children[3].componentName, "SvgDecoration");

  const freeformModuleTreeResult = await client.callTool({
    name: "generate_module_tree_schema",
    arguments: freeformModuleInput,
  });
  assert.equal(freeformModuleTreeResult.isError, undefined);
  const toolFreeformTree = readToolJson(freeformModuleTreeResult);
  assert.equal(toolFreeformTree.componentName, "__Group__");
  assert.equal(toolFreeformTree.title, "核心指标");
  assert.deepEqual(
    toolFreeformTree.children.map((item: JsonObject) => item.title),
    ["标题", "主内容", "装饰", "背景"],
    "MCP FreeformModule tree should apply common semantic grouping",
  );
}
