import assert from "node:assert/strict";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, hasPropName, readToolJson } from "./helpers.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpDashboardToolTests({
  client,
  dashboardSpec,
}: McpToolContext): Promise<void> {
  const dashboardValidationResult = await client.callTool({
    name: "validate_dashboard_spec",
    arguments: dashboardSpec,
  });
  assert.equal(dashboardValidationResult.isError, undefined);
  const toolDashboardValidation = readToolJson(dashboardValidationResult);
  assert.equal(toolDashboardValidation.valid, true);
  assert.deepEqual(toolDashboardValidation.errors, []);

  const dashboardSchemaResult = await client.callTool({
    name: "generate_dashboard_schema",
    arguments: dashboardSpec,
  });
  assert.equal(dashboardSchemaResult.isError, undefined);
  const toolDashboardTree = readToolJson(dashboardSchemaResult);
  const toolDashboardNodes = flattenEditorNodes(toolDashboardTree as JsonObject);
  assert.equal(toolDashboardTree.componentName, "__Group__");
  assert.equal(toolDashboardTree.title, "运营洞察大屏");
  assert.equal(
    toolDashboardTree.children.at(-1)?.title,
    "背景",
    "DashboardSpec MCP compiler should keep root background group last",
  );
  const toolDashboardHeaderGroup = toolDashboardTree.children.find(
    (item: JsonObject) => item.componentName === "__Group__" && item.title === "顶部信息组",
  ) as JsonObject | undefined;
  assert.ok(
    toolDashboardHeaderGroup,
    "DashboardSpec MCP compiler should compile explicit component groups",
  );
  assert.equal(
    (toolDashboardHeaderGroup.children as JsonObject[]).at(-1)?.title,
    "背景",
    "DashboardSpec MCP compiler should keep explicit group background last",
  );
  assert.ok(
    toolDashboardNodes.some((item) => item.componentName === "PieChart"),
    "DashboardSpec MCP compiler should include module chart nodes",
  );
  assert.ok(
    toolDashboardNodes.some((item) => hasPropName(item, "AI自定义标题线")),
    "DashboardSpec MCP compiler should preserve LLM-authored decorations",
  );
}
