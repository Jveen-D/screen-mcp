import assert from "node:assert/strict";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { JsonObject } from "../../src/types/component.js";

export function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>) {
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

export function hasPropName(item: JsonObject, name: string): boolean {
  const props = item.props;
  return typeof props === "object" && props !== null && !Array.isArray(props) && props.name === name;
}

export function nodeProps(item: JsonObject | undefined): JsonObject {
  const props = item?.props;
  assert.ok(
    typeof props === "object" && props !== null && !Array.isArray(props),
    "editor node should have object props",
  );
  return props;
}

export function flattenEditorNodes(node: JsonObject): JsonObject[] {
  const children = Array.isArray(node.children)
    ? (node.children as JsonObject[])
    : [];

  return [node, ...children.flatMap(flattenEditorNodes)];
}

export function assertUniqueIds(ids: string[], message: string): void {
  assert.equal(new Set(ids).size, ids.length, message);
}

export function assertRandomizedId(
  id: string,
  semanticPart: string,
  message: string,
): void {
  assert.ok(id.includes(semanticPart), message);
  assert.match(id, /_[0-9a-f]{8}$/u, `${message}: should end with random segment`);
  assert.ok(id.length <= 50, `${message}: should not exceed backend id length limit`);
}

export function asChartObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasTextWithFragments(values: unknown[], fragments: string[]): boolean {
  return values.some(
    (value) =>
      typeof value === "string" &&
      fragments.every((fragment) => value.includes(fragment)),
  );
}

export function isPercentPair(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "string" && /^\d+(?:\.\d+)?%$/u.test(item))
  );
}
