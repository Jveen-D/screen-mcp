import type { JsonObject, JsonValue } from "../types/component.js";

const DESCRIPTION_LIMIT = 160;
const DROP_KEYS = new Set([
  "examples",
  "visualRules",
  "mergeRules",
  "layoutRules",
  "baseConfig",
  "layerRules",
]);

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shorten(value: string, limit = DESCRIPTION_LIMIT): string {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function compactJson(value: JsonValue, keepGroupSchema = false): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => compactJson(item, keepGroupSchema));
  }

  if (!isJsonObject(value)) {
    return typeof value === "string" ? shorten(value) : value;
  }

  const next: JsonObject = {};

  for (const [key, childValue] of Object.entries(value)) {
    if (DROP_KEYS.has(key)) {
      continue;
    }

    if (key === "layoutRuleGroups" && Array.isArray(childValue)) {
      next.layoutRuleGroups = childValue
        .filter(isJsonObject)
        .map((group) => ({
          category: group.category,
          priority: group.priority,
          description:
            typeof group.description === "string"
              ? shorten(group.description, 100)
              : group.description,
          ruleCount: Array.isArray(group.rules) ? group.rules.length : 0,
        }));
      continue;
    }

    if (key === "groupSchema") {
      if (keepGroupSchema && isJsonObject(childValue)) {
        next.groupSchema = {
          componentName: childValue.componentName,
          structVersion: childValue.structVersion,
          props: childValue.props,
        };
      }
      continue;
    }

    if (key === "description" && typeof childValue === "string") {
      next[key] = shorten(childValue);
      continue;
    }

    next[key] = compactJson(childValue, keepGroupSchema);
  }

  return next;
}

function addCounts(compact: JsonObject, full: JsonObject): JsonObject {
  return {
    ...compact,
    compact: true,
    exampleCount: Array.isArray(full.examples) ? full.examples.length : 0,
    visualRuleCount: Array.isArray(full.visualRules) ? full.visualRules.length : 0,
    layoutRuleCount: Array.isArray(full.layoutRules) ? full.layoutRules.length : 0,
    fullDetailHint:
      "Pass detail:'full' only when exact examples or full rule text are needed.",
  };
}

export function compactComponentCapability(capability: JsonObject): JsonObject {
  return addCounts(compactJson(capability) as JsonObject, capability);
}

export function compactModuleCapability(capability: JsonObject): JsonObject {
  return addCounts(compactJson(capability, true) as JsonObject, capability);
}
