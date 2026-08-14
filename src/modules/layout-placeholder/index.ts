import {
  componentSchemaToEditorNode,
  generateComponentsSchemas,
  uniqueSchemaId,
} from "../../core/schema.js";
import { groupEditorTreeChildren } from "../../core/grouping.js";
import type {
  ComponentSchema,
  EditorGroupNode,
  JsonObject,
  JsonValue,
} from "../../types/component.js";
import type { ModuleDefinition, ModuleInput, ModuleStyle } from "../../types/module.js";
import { layoutPlaceholderCapability } from "./capability.js";

const DEFAULT_MODULE_Z_INDEX = 10;
const TEXT_INSET = 16;
const TITLE_TOP_OFFSET = 16;
const DESCRIPTION_TOP_OFFSET = 52;
const MIN_WIDTH = 120;
const MIN_HEIGHT = 96;
const BORDER_SVG = [
  '<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">',
  '<rect x="1" y="1" width="98" height="98" rx="0" fill="none" stroke="currentColor"',
  ' stroke-width="1" vector-effect="non-scaling-stroke"/>',
  "</svg>",
].join("");

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: JsonValue | undefined, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required module prop: ${fieldName}`);
  }

  return value.trim();
}

function assertMeaningfulText(value: JsonValue | undefined, fieldName: string): string {
  const text = assertString(value, fieldName);
  if (/^(?:面板\d+|待定|占位(?:文本|内容)?|placeholder)$/iu.test(text)) {
    throw new Error(`${fieldName} must describe real planned content, not placeholder copy`);
  }

  return text;
}

function assertStyle(value: JsonValue | undefined): ModuleStyle {
  if (!isJsonObject(value)) {
    throw new Error("missing required module prop: style");
  }

  for (const key of ["left", "top", "width", "height"]) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key])) {
      throw new Error(`missing required module style number: ${key}`);
    }
  }

  if ((value.width as number) < MIN_WIDTH || (value.height as number) < MIN_HEIGHT) {
    throw new Error(
      `LayoutPlaceholder style must be at least ${MIN_WIDTH}x${MIN_HEIGHT}`,
    );
  }

  return {
    ...value,
    position: "absolute",
    zIndex:
      typeof value.zIndex === "number" ? value.zIndex : DEFAULT_MODULE_Z_INDEX,
  } as ModuleStyle;
}

function themeColor(theme: JsonValue | undefined, key: string, fallback: string): string {
  if (!isJsonObject(theme)) {
    return fallback;
  }

  const value = theme[key];
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function normalizeModuleInput(rawInput: ModuleInput): ModuleInput {
  const moduleName = assertString(rawInput.moduleName, "moduleName");
  if (moduleName !== "LayoutPlaceholder") {
    throw new Error(`unknown moduleName: ${moduleName}`);
  }

  if (!isJsonObject(rawInput.slots) || Object.keys(rawInput.slots).length > 0) {
    throw new Error("LayoutPlaceholder slots must be an empty object");
  }

  return {
    ...rawInput,
    moduleName,
    logicalId: uniqueSchemaId(assertString(rawInput.logicalId, "logicalId")),
    parentLogicalId: assertString(rawInput.parentLogicalId, "parentLogicalId"),
    title: assertMeaningfulText(rawInput.title, "title"),
    presentation: assertMeaningfulText(rawInput.presentation, "presentation"),
    contentSummary: assertMeaningfulText(rawInput.contentSummary, "contentSummary"),
    style: assertStyle(rawInput.style),
    slots: {},
  };
}

function createComponentProps(input: ModuleInput, parentLogicalId: string): JsonObject[] {
  const title = input.title as string;
  const presentation = input.presentation as string;
  const contentSummary = input.contentSummary as string;
  const textColor = themeColor(input.theme, "textColor", "#DFF8FF");
  const primaryColor = themeColor(input.theme, "primaryColor", "#3A84FF");
  const textWidth = input.style.width - TEXT_INSET * 2;
  const textZIndex = input.style.zIndex + 2;

  return [
    {
      componentName: "SingleText",
      logicalId: `${input.logicalId}_title`,
      parentLogicalId,
      name: `占位标题-${title}`,
      textContent: title,
      layerRole: "content",
      style: {
        position: "absolute",
        left: input.style.left + TEXT_INSET,
        top: input.style.top + TITLE_TOP_OFFSET,
        width: textWidth,
        height: 20,
        fontSize: 20,
        fontWeight: "bold",
        color: textColor,
        textAlign: "left",
        backgroundColor: "rgba(0,0,0,0)",
        lineHeight: 1,
        zIndex: textZIndex,
      },
    },
    {
      componentName: "SingleText",
      logicalId: `${input.logicalId}_description`,
      parentLogicalId,
      name: `占位说明-${title}`,
      textContent: `${presentation} · ${contentSummary}`,
      layerRole: "content",
      opacity: 0.75,
      style: {
        position: "absolute",
        left: input.style.left + TEXT_INSET,
        top: input.style.top + DESCRIPTION_TOP_OFFSET,
        width: textWidth,
        height: 14,
        fontSize: 14,
        fontWeight: "normal",
        color: textColor,
        textAlign: "left",
        backgroundColor: "rgba(0,0,0,0)",
        lineHeight: 1,
        zIndex: textZIndex,
      },
    },
    {
      componentName: "SvgDecoration",
      logicalId: `${input.logicalId}_border`,
      parentLogicalId,
      name: `占位-${title}`,
      layerRole: "decoration",
      opacity: 0.72,
      svgSource: "custom",
      svgContent: BORDER_SVG,
      svgFit: "fill",
      primaryColor,
      strokeWidth: 1,
      glow: {
        isActive: false,
        color: primaryColor,
        blur: 0,
      },
      style: {
        position: "absolute",
        left: input.style.left,
        top: input.style.top,
        width: input.style.width,
        height: input.style.height,
        backgroundColor: "rgba(0,0,0,0)",
        zIndex: input.style.zIndex + 1,
      },
    },
  ];
}

function generateLayoutPlaceholderSchemasForInput(
  input: ModuleInput,
  parentLogicalId: string,
): ComponentSchema[] {
  return generateComponentsSchemas(createComponentProps(input, parentLogicalId));
}

export function generateLayoutPlaceholderSchemas(rawInput: ModuleInput): ComponentSchema[] {
  const input = normalizeModuleInput(rawInput);
  return generateLayoutPlaceholderSchemasForInput(input, input.parentLogicalId);
}

export function generateLayoutPlaceholderTreeSchema(rawInput: ModuleInput): EditorGroupNode {
  const input = normalizeModuleInput(rawInput);
  const flatChildren = generateLayoutPlaceholderSchemasForInput(input, input.logicalId)
    .map(componentSchemaToEditorNode);
  const children = groupEditorTreeChildren(flatChildren, {
    parentId: input.logicalId,
    mode: "none",
  });

  return {
    id: input.logicalId,
    componentName: "__Group__",
    structVersion: "0.0.0",
    props: {
      style: input.style,
    },
    title: `布局占位-${input.title as string}`,
    isHidden: false,
    isLocked: false,
    isGroup: true,
    children,
  };
}

export const layoutPlaceholderDefinition = {
  moduleName: "LayoutPlaceholder",
  displayName: "布局确认占位",
  description:
    "布局确认阶段专用模块，根据调用方给出的真实标题、表现形式、内容摘要和区域生成临时边框及两行文字。",
  capability: layoutPlaceholderCapability,
  generateSchemas: generateLayoutPlaceholderSchemas,
  generateTreeSchema: generateLayoutPlaceholderTreeSchema,
} satisfies ModuleDefinition;
