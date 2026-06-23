import {
  componentSchemaToEditorNode,
  generateComponentsSchema,
  sortEditorTreeChildren,
  toSchemaId,
  uniqueSchemaId,
} from "./schema.js";
import { generateModuleTreeSchema } from "./modules.js";
import type { EditorGroupNode, EditorTreeNode, JsonObject, JsonValue } from "../types/component.js";

type Rect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: JsonValue | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asArray(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isJsonObject);
}

function dashboardRootId(input: JsonObject): string {
  const logicalId = input.logicalId;
  if (typeof logicalId === "string" && logicalId.trim() !== "") {
    return toSchemaId(logicalId);
  }

  return uniqueSchemaId("dashboard_root", "fs");
}

function canvasSize(input: JsonObject): { width: number; height: number } {
  const canvas = isJsonObject(input.canvas) ? input.canvas : {};

  return {
    width: asFiniteNumber(canvas.width) ?? 1920,
    height: asFiniteNumber(canvas.height) ?? 1080,
  };
}

function dashboardTitle(input: JsonObject): string {
  return typeof input.title === "string" && input.title.trim() !== ""
    ? input.title.trim()
    : "大屏";
}

function withParentAndTheme(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
): JsonObject {
  const next: JsonObject = {
    ...item,
    parentLogicalId:
      typeof item.parentLogicalId === "string" && item.parentLogicalId.trim() !== ""
        ? item.parentLogicalId
        : parentId,
  };

  if (theme && !isJsonObject(next.theme)) {
    next.theme = theme;
  }

  return next;
}

function compileComponent(item: JsonObject, parentId: string): EditorTreeNode {
  if (typeof item.componentName !== "string" || item.componentName.trim() === "") {
    throw new Error("dashboard component missing componentName");
  }

  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error(`dashboard component ${item.componentName} missing logicalId`);
  }

  const schema = generateComponentsSchema(
    withParentAndTheme(item, parentId, undefined),
  );
  return componentSchemaToEditorNode(schema);
}

function compileModule(
  item: JsonObject,
  parentId: string,
  theme: JsonObject | undefined,
  grouping: JsonObject | undefined,
): EditorTreeNode {
  if (typeof item.moduleName !== "string" || item.moduleName.trim() === "") {
    throw new Error("dashboard module missing moduleName");
  }

  if (typeof item.logicalId !== "string" || item.logicalId.trim() === "") {
    throw new Error(`dashboard module ${item.moduleName} missing logicalId`);
  }

  const moduleInput = withParentAndTheme(item, parentId, theme);
  if (grouping && !isJsonObject(moduleInput.grouping)) {
    moduleInput.grouping = grouping;
  }

  return generateModuleTreeSchema(moduleInput);
}

function rectFromItem(item: JsonObject, fallbackId: string): Rect | undefined {
  const style = isJsonObject(item.style) ? item.style : undefined;
  if (!style) {
    return undefined;
  }

  const left = asFiniteNumber(style.left);
  const top = asFiniteNumber(style.top);
  const width = asFiniteNumber(style.width);
  const height = asFiniteNumber(style.height);

  if (
    left === undefined ||
    top === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return undefined;
  }

  const id =
    typeof item.logicalId === "string" && item.logicalId.trim() !== ""
      ? item.logicalId
      : fallbackId;

  return { id, left, top, width, height };
}

function rectsOverlap(left: Rect, right: Rect): boolean {
  return (
    left.left < right.left + right.width &&
    left.left + left.width > right.left &&
    left.top < right.top + right.height &&
    left.top + left.height > right.top
  );
}

export function validateDashboardSpec(input: JsonObject): JsonObject {
  const errors: string[] = [];
  const warnings: string[] = [];
  const canvas = canvasSize(input);
  const components = asArray(input.components);
  const modules = asArray(input.modules);
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const rects: Rect[] = [];

  if (components.length === 0 && modules.length === 0) {
    errors.push("dashboard spec must include at least one component or module");
  }

  if (canvas.width <= 0 || canvas.height <= 0) {
    errors.push("canvas width and height must be positive numbers");
  }

  if (
    grouping &&
    grouping.mode !== undefined &&
    grouping.mode !== "semantic" &&
    grouping.mode !== "none"
  ) {
    errors.push("grouping.mode must be semantic or none");
  }

  components.forEach((component, index) => {
    if (typeof component.componentName !== "string" || component.componentName.trim() === "") {
      errors.push(`components[${index}] missing componentName`);
    }
    if (typeof component.logicalId !== "string" || component.logicalId.trim() === "") {
      errors.push(`components[${index}] missing logicalId`);
    }

    const rect = rectFromItem(component, `components[${index}]`);
    if (rect) {
      rects.push(rect);
    } else {
      warnings.push(`components[${index}] has no complete absolute style`);
    }
  });

  modules.forEach((module, index) => {
    if (typeof module.moduleName !== "string" || module.moduleName.trim() === "") {
      errors.push(`modules[${index}] missing moduleName`);
    }
    if (typeof module.logicalId !== "string" || module.logicalId.trim() === "") {
      errors.push(`modules[${index}] missing logicalId`);
    }

    const rect = rectFromItem(module, `modules[${index}]`);
    if (rect) {
      rects.push(rect);
      if (
        rect.left < 0 ||
        rect.top < 0 ||
        rect.left + rect.width > canvas.width ||
        rect.top + rect.height > canvas.height
      ) {
        warnings.push(`${rect.id} extends outside canvas bounds`);
      }
    } else {
      errors.push(`modules[${index}] missing complete style left/top/width/height`);
    }
  });

  for (let leftIndex = 0; leftIndex < rects.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rects.length; rightIndex += 1) {
      const left = rects[leftIndex];
      const right = rects[rightIndex];
      if (rectsOverlap(left, right)) {
        warnings.push(`${left.id} overlaps ${right.id}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateDashboardSchema(input: JsonObject): EditorGroupNode {
  const validation = validateDashboardSpec(input);
  const errors = validation.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const rootId = dashboardRootId(input);
  const canvas = canvasSize(input);
  const theme = isJsonObject(input.theme) ? input.theme : undefined;
  const grouping = isJsonObject(input.grouping) ? input.grouping : undefined;
  const components = asArray(input.components);
  const modules = asArray(input.modules);
  const children: EditorTreeNode[] = [
    ...components.map((component) => compileComponent(component, rootId)),
    ...modules.map((module) => compileModule(module, rootId, theme, grouping)),
  ];

  const root: EditorGroupNode = {
    id: rootId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        zIndex: 1,
      },
      ...(theme ? { theme } : {}),
    },
    title: dashboardTitle(input),
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };

  return sortEditorTreeChildren(root) as EditorGroupNode;
}
