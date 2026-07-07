import assert from "node:assert/strict";
import fs from "node:fs";
import { getScreenToolDefinitions } from "../src/mcp/screenServer.js";
import { getComponentCapability, listComponents } from "../src/core/registry.js";
import type { JsonObject, JsonValue } from "../src/types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertTransportEntrypointIsThin(filePath: string): void {
  const source = fs.readFileSync(filePath, "utf8");
  assert.equal(
    source.includes("registerTool("),
    false,
    `${filePath} must not register MCP tools directly; use src/mcp/screenServer.ts`,
  );
  assert.equal(
    source.includes("new McpServer"),
    false,
    `${filePath} must not construct McpServer directly; use createScreenMcpServer()`,
  );
}

function assertUniqueToolNames(): void {
  const tools = getScreenToolDefinitions();
  const names = tools.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length, "MCP tool names must be unique");
}

function assertNoDuplicatePaths(items: JsonValue | undefined, label: string): void {
  if (!Array.isArray(items)) {
    return;
  }

  const seen = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (!isJsonObject(item)) {
      continue;
    }

    const path = typeof item.path === "string" ? item.path : "";
    if (path !== "") {
      assert.equal(
        seen.has(path),
        false,
        `${label} contains duplicate capability path: ${path}`,
      );
      seen.add(path);
    }

    assertNoDuplicatePaths(item.children, `${label}[${index}].children`);
  }
}

function assertComponentCapabilitiesHaveUniquePaths(): void {
  for (const component of listComponents()) {
    const capability = getComponentCapability(component.componentName);
    assertNoDuplicatePaths(
      capability.requiredProps,
      `${component.componentName}.requiredProps`,
    );
    assertNoDuplicatePaths(
      capability.aiWritableProps,
      `${component.componentName}.aiWritableProps`,
    );
  }
}

function assertReadmeKeepsCoreBoundary(): void {
  const readme = fs.readFileSync("README.md", "utf8");
  for (const phrase of [
    "LLM 负责设计决策",
    "MCP 负责能力说明、校验、默认组件 props 合并和 schema 编译",
    "不是大屏模板生成器",
    "项目不沉淀行业模板、主题模板、布局模板或关键词到模板的映射",
  ]) {
    assert.ok(readme.includes(phrase), `README.md must keep boundary phrase: ${phrase}`);
  }
}

assertTransportEntrypointIsThin("src/server.ts");
assertTransportEntrypointIsThin("src/http-server.ts");
assertUniqueToolNames();
assertComponentCapabilitiesHaveUniquePaths();
assertReadmeKeepsCoreBoundary();

console.log("project rules passed");
