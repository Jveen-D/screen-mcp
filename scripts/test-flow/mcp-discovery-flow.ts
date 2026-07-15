import assert from "node:assert/strict";
import { getScreenToolDefinitions } from "../../src/mcp/screenServer.js";
import type { McpToolContext } from "./mcp-tool-context.js";

export async function runMcpDiscoveryTests({ client }: McpToolContext): Promise<void> {
  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name).sort();
  const expectedToolNames = getScreenToolDefinitions().map((tool) => tool.name).sort();
  assert.deepEqual(
    toolNames,
    expectedToolNames,
    "MCP server should expose exactly the centralized tool definitions",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_server_diagnostics"),
    "MCP server should expose diagnostics",
  );
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
  assert.ok(
    tools.tools.some((tool) => tool.name === "list_modules"),
    "MCP server should expose list_modules",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "get_module_capability"),
    "MCP server should expose get_module_capability",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_module_schema"),
    "MCP server should expose generate_module_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_module_tree_schema"),
    "MCP server should expose generate_module_tree_schema",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "validate_dashboard_spec"),
    "MCP server should expose DashboardSpec validation",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_dashboard_schema"),
    "MCP server should expose DashboardSpec compiler",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "validate_dashboard_project_spec"),
    "MCP server should expose project and master validation",
  );
  assert.ok(
    tools.tools.some((tool) => tool.name === "generate_dashboard_project_schema"),
    "MCP server should expose project and master compilation",
  );
  const serverInstructions = client.getInstructions();
  assert.ok(
    serverInstructions?.includes("LLM owns design decisions") &&
      serverInstructions.includes("DashboardSpec") &&
      serverInstructions.includes("generate_dashboard_schema") &&
      serverInstructions.includes("generate_dashboard_project_schema") &&
      serverInstructions.includes("masters") &&
      serverInstructions.includes("masterLogicalIds") &&
      serverInstructions.includes("FreeformModule") &&
      serverInstructions.includes("grouping.singleChildGroup"),
    "MCP server instructions should steer full dashboards through LLM-authored DashboardSpec",
  );
  assert.ok(
    serverInstructions?.includes("完整schema") &&
      serverInstructions.includes("complete JSON") &&
      serverInstructions.includes("complete JSON returned by the tool"),
    "MCP server instructions should require complete schema output when requested",
  );
  const moduleTreeTool = tools.tools.find(
    (tool) => tool.name === "generate_module_tree_schema",
  );
  assert.ok(
    moduleTreeTool?.description?.includes("__Group__") &&
      moduleTreeTool.description.includes("grouping.singleChildGroup"),
    "module tree tool should document grouped module tree generation compactly",
  );
  assert.ok(
    moduleTreeTool?.description &&
      moduleTreeTool.description.length < 360,
    "module tree tool description should stay compact for faster model routing",
  );
}
