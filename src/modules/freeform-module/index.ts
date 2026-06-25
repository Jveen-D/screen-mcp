import {
  componentSchemaToEditorNode,
  generateComponentsSchemas,
  uniqueSchemaId,
} from "../../core/schema.js";
import {
  groupEditorTreeChildren,
  resolveSemanticGroupingOptions,
} from "../../core/grouping.js";
import type {
  ComponentSchema,
  EditorGroupNode,
  JsonObject,
  JsonValue,
} from "../../types/component.js";
import type { ModuleDefinition, ModuleInput, ModuleStyle } from "../../types/module.js";
import { freeformModuleCapability } from "./capability.js";

const DEFAULT_MODULE_Z_INDEX = 10;

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: JsonValue | undefined, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required module prop: ${fieldName}`);
  }

  return value;
}

function assertStyle(value: JsonValue | undefined): ModuleStyle {
  if (!isJsonObject(value)) {
    throw new Error("missing required module prop: style");
  }

  for (const key of ["left", "top", "width", "height"]) {
    if (typeof value[key] !== "number") {
      throw new Error(`missing required module style number: ${key}`);
    }
  }

  return {
    ...value,
    position: "absolute",
    zIndex:
      typeof value.zIndex === "number" ? value.zIndex : DEFAULT_MODULE_Z_INDEX,
  } as ModuleStyle;
}

function normalizeModuleInput(rawInput: ModuleInput): ModuleInput {
  const moduleName = assertString(rawInput.moduleName, "moduleName");
  if (moduleName !== "FreeformModule") {
    throw new Error(`unknown moduleName: ${moduleName}`);
  }

  return {
    ...rawInput,
    moduleName,
    logicalId: uniqueSchemaId(assertString(rawInput.logicalId, "logicalId")),
    parentLogicalId: assertString(rawInput.parentLogicalId, "parentLogicalId"),
    style: assertStyle(rawInput.style),
  };
}

function normalizeChildInput(child: JsonObject, index: number): JsonObject {
  const props = isJsonObject(child.props) ? child.props : {};
  const componentName =
    typeof child.componentName === "string" && child.componentName.trim() !== ""
      ? child.componentName
      : typeof props.componentName === "string"
        ? props.componentName
        : "";
  const logicalId =
    typeof child.logicalId === "string" && child.logicalId.trim() !== ""
      ? child.logicalId
      : typeof props.logicalId === "string"
        ? props.logicalId
        : "";
  const style = isJsonObject(child.style)
    ? child.style
    : isJsonObject(props.style)
      ? props.style
      : undefined;

  if (componentName === "") {
    throw new Error(`invalid module slot: children[${index}].componentName`);
  }

  if (logicalId === "") {
    throw new Error(`invalid module slot: children[${index}].logicalId`);
  }

  if (!style) {
    throw new Error(`invalid module slot: children[${index}].style`);
  }

  const normalized: JsonObject = {
    ...props,
    ...child,
    componentName,
    logicalId,
    style,
  };
  delete normalized.props;

  return normalized;
}

function childInputs(input: ModuleInput): JsonObject[] {
  const slots = input.slots;
  if (!isJsonObject(slots)) {
    throw new Error("missing required module prop: slots");
  }

  if (!Array.isArray(slots.children)) {
    throw new Error("missing required module slot array: children");
  }

  return slots.children.map((child, index) => {
    if (!isJsonObject(child)) {
      throw new Error(`invalid module slot: children[${index}]`);
    }

    return normalizeChildInput(child, index);
  });
}

function withModuleContext(input: ModuleInput, child: JsonObject): JsonObject {
  const next: JsonObject = {
    ...child,
    parentLogicalId: input.logicalId,
  };

  if (isJsonObject(input.theme) && !isJsonObject(next.theme)) {
    next.theme = input.theme;
  }

  return next;
}

function generateFreeformModuleSchemasForInput(input: ModuleInput): ComponentSchema[] {
  return generateComponentsSchemas(
    childInputs(input).map((child) => withModuleContext(input, child)),
  );
}

export function generateFreeformModuleSchemas(rawInput: ModuleInput): ComponentSchema[] {
  return generateFreeformModuleSchemasForInput(normalizeModuleInput(rawInput));
}

export function generateFreeformModuleTreeSchema(rawInput: ModuleInput): EditorGroupNode {
  const input = normalizeModuleInput(rawInput);
  const flatChildren = generateFreeformModuleSchemasForInput(input).map(componentSchemaToEditorNode);
  const children = groupEditorTreeChildren(
    flatChildren,
    resolveSemanticGroupingOptions(input, input.logicalId),
  );

  return {
    id: input.logicalId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: input.style,
    },
    title:
      typeof input.title === "string" && input.title.trim() !== ""
        ? input.title
        : "自由模块",
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

export const freeformModuleDefinition = {
  moduleName: "FreeformModule",
  displayName: "自由模块",
  description: "自由模块，用 slots.children 承载 LLM 明确设计的任意组件。",
  capability: freeformModuleCapability,
  generateSchemas: generateFreeformModuleSchemas,
  generateTreeSchema: generateFreeformModuleTreeSchema,
} satisfies ModuleDefinition;
