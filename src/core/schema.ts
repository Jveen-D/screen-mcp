import { randomBytes } from "node:crypto";
import { cloneJson, deepMerge, removeAiForbiddenProps } from "./merge.js";
import { getComponentDefinition } from "./registry.js";
import type {
  AiComponentProps,
  ComponentSchema,
  EditorComponentNode,
  EditorGroupNode,
  EditorTreeNode,
  JsonObject,
  JsonValue,
} from "../types/component.js";

export const MAX_SCHEMA_ID_LENGTH = 50;
const DEFAULT_RANDOM_ID_LENGTH = 8;

function assertRequiredString(
  props: JsonObject,
  key: "componentName" | "logicalId" | "parentLogicalId",
): string {
  const value = props[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required prop: ${key}`);
  }

  return value;
}

export function toSchemaId(value: string, suffix = ""): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const fallback = normalized === "" ? "component" : normalized;

  if (suffix === "") {
    return fallback.slice(0, MAX_SCHEMA_ID_LENGTH);
  }

  const suffixWithSeparator = suffix.startsWith("_") ? suffix : `_${suffix}`;
  const maxBaseLength = MAX_SCHEMA_ID_LENGTH - suffixWithSeparator.length;
  if (maxBaseLength <= 0) {
    return suffixWithSeparator.slice(0, MAX_SCHEMA_ID_LENGTH);
  }

  return `${fallback.slice(0, maxBaseLength)}${suffixWithSeparator}`;
}

function randomIdSegment(length = DEFAULT_RANDOM_ID_LENGTH): string {
  return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

export function uniqueSchemaId(value: string, suffix = ""): string {
  const uniqueSuffix = suffix === ""
    ? randomIdSegment()
    : `${suffix}_${randomIdSegment()}`;

  return toSchemaId(value, uniqueSuffix);
}

function hasRandomIdSegment(value: string): boolean {
  return /_[0-9a-f]{8}$/u.test(value);
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertComponentGenerationData(componentName: string, props: JsonObject): void {
  if (componentName !== "Gauge") {
    return;
  }

  const value = props.value;
  const numericValue = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : Number.NaN;
  if (!Number.isFinite(numericValue)) {
    throw new Error(
      "Gauge must include explicit numeric value; MCP maps value to datasource.constantData[0].value",
    );
  }
}

function getChartDataRows(props: JsonObject): JsonValue[] | undefined {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return undefined;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    return undefined;
  }

  return cloneJson(constant.data);
}

function isDefaultDemoRow(row: JsonValue): boolean {
  if (!isJsonObject(row)) {
    return false;
  }

  const name = typeof row.name === "string" ? row.name.trim() : "";
  const type = typeof row.type === "string" ? row.type.trim() : "";

  return /^类目\d+$/u.test(name) &&
    (type === "" || /^系列[\d一二三四五六七八九十]*$/u.test(type) || type === "进度");
}

export function hasDefaultDemoChartRows(rows: JsonValue[] | undefined): boolean {
  return Array.isArray(rows) && rows.length > 0 && rows.every(isDefaultDemoRow);
}

function getChartDataIndicatorDisplayName(props: JsonObject): string | undefined {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return undefined;
  }

  const indicator = chartData.indicator;
  if (!Array.isArray(indicator)) {
    return undefined;
  }

  const firstIndicator = indicator[0];
  if (!isJsonObject(firstIndicator)) {
    return undefined;
  }

  const fieldDataConfig = firstIndicator.fieldDataConfig;
  if (!isJsonObject(fieldDataConfig)) {
    return undefined;
  }

  const chartDisplayName = fieldDataConfig.chartDisplayName;
  if (typeof chartDisplayName !== "string" || chartDisplayName.trim() === "") {
    return undefined;
  }

  return chartDisplayName;
}

function removeChartData(props: JsonObject): JsonObject {
  const nextProps = cloneJson(props);
  delete nextProps.chartData;
  return nextProps;
}

function applySingleTextLineBoxDefaults(props: JsonObject): JsonObject {
  if (props.componentName !== "SingleText") {
    return props;
  }

  const nextProps = cloneJson(props);
  const style = nextProps.style;
  if (!isJsonObject(style)) {
    return nextProps;
  }

  if (style.lineHeight === undefined) {
    style.lineHeight = 1.35;
  }

  if (style.height === undefined && typeof style.fontSize === "number" && style.fontSize > 0) {
    style.height = Math.ceil(style.fontSize * 1.35);
  }

  return nextProps;
}

function stripCompilerOnlyProps(props: JsonObject): JsonObject {
  const nextProps = cloneJson(props);
  delete nextProps.theme;
  return nextProps;
}

function normalizeLongHexColors(value: JsonValue): JsonValue {
  if (typeof value === "string") {
    return value.replace(/#[0-9a-fA-F]{9,}\b/gu, (match) => match.slice(0, 9));
  }

  if (Array.isArray(value)) {
    return value.map(normalizeLongHexColors);
  }

  if (!isJsonObject(value)) {
    return value;
  }

  const result: JsonObject = {};
  for (const [key, child] of Object.entries(value)) {
    result[key] = normalizeLongHexColors(child);
  }
  return result;
}

function applyChartDataRows(
  props: JsonObject,
  rows: JsonValue[] | undefined,
  componentName: string,
  indicatorDisplayName?: string,
): void {
  props.chartData = cloneJson(getComponentDefinition(componentName).defaultProps.chartData);

  if (indicatorDisplayName) {
    const chartData = props.chartData;
    if (isJsonObject(chartData)) {
      const indicator = chartData.indicator;
      if (Array.isArray(indicator)) {
        const firstIndicator = indicator[0];
        if (isJsonObject(firstIndicator)) {
          const fieldDataConfig = isJsonObject(firstIndicator.fieldDataConfig)
            ? firstIndicator.fieldDataConfig
            : {};
          firstIndicator.fieldDataConfig = {
            ...fieldDataConfig,
            chartDisplayName: indicatorDisplayName,
          };
        }
      }
    }
  }

  if (!rows) {
    return;
  }

  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const constant = chartData.constant;
  if (isJsonObject(constant)) {
    constant.data = rows;
  }
}

function assertNoDefaultChartDataFallback(
  componentName: string,
  rows: JsonValue[] | undefined,
): void {
  if (hasDefaultDemoChartRows(rows)) {
    throw new Error(
      `${componentName} chartData.constant.data must use real business categories, not default 类目/系列 demo rows`,
    );
  }

  const defaultRows = getChartDataRows(getComponentDefinition(componentName).defaultProps);
  if ((!rows || rows.length === 0) && hasDefaultDemoChartRows(defaultRows)) {
    throw new Error(
      `${componentName} must include explicit chartData.constant.data with real business categories; direct component generation will not fall back to default 类目/系列 demo rows`,
    );
  }
}

export function generateComponentProps(aiProps: JsonObject): JsonObject {
  const componentName = assertRequiredString(aiProps, "componentName");
  const logicalId = assertRequiredString(aiProps, "logicalId");
  const parentLogicalId = assertRequiredString(aiProps, "parentLogicalId");
  assertComponentGenerationData(componentName, aiProps);

  const definition = getComponentDefinition(componentName);
  const isChartComponent = definition.componentType === "chart";
  const sanitizedAiProps = applySingleTextLineBoxDefaults(
    removeAiForbiddenProps(
      {
        ...aiProps,
        logicalId: hasRandomIdSegment(logicalId)
          ? toSchemaId(logicalId)
          : uniqueSchemaId(logicalId),
        parentLogicalId: toSchemaId(parentLogicalId),
      },
      { componentName, isChartComponent },
    ),
  );
  const chartDataRows = isChartComponent ? getChartDataRows(sanitizedAiProps) : undefined;
  const indicatorDisplayName = isChartComponent
    ? getChartDataIndicatorDisplayName(sanitizedAiProps)
    : undefined;
  if (isChartComponent) {
    assertNoDefaultChartDataFallback(componentName, chartDataRows);
  }
  const mergeableAiProps = isChartComponent ? removeChartData(sanitizedAiProps) : sanitizedAiProps;
  const mergedProps = deepMerge(definition.defaultProps, mergeableAiProps);

  if (isChartComponent) {
    applyChartDataRows(mergedProps, chartDataRows, componentName, indicatorDisplayName);
  } else {
    mergedProps.chartData = cloneJson(definition.defaultProps.chartData);
  }

  return normalizeLongHexColors(
    stripCompilerOnlyProps(definition.normalizeProps?.(mergedProps) ?? mergedProps),
  ) as JsonObject;
}

function isContainerChild(componentName: string): "earth3DId" | "mapId" | null {
  if (componentName.startsWith("Earth3D-")) {
    return "earth3DId";
  }
  if (componentName.startsWith("GaodeMap-")) {
    return "mapId";
  }
  return null;
}

function generateChildSchemas(
  parentLogicalId: string,
  childrenProps: JsonValue | undefined,
): ComponentSchema[] | undefined {
  if (!Array.isArray(childrenProps)) {
    return undefined;
  }

  const result: ComponentSchema[] = [];

  for (let index = 0; index < childrenProps.length; index += 1) {
    const child = childrenProps[index];
    if (!isJsonObject(child)) {
      continue;
    }

    const childComponentName =
      typeof child.componentName === "string" ? child.componentName : "";
    const parentIdKey = isContainerChild(childComponentName);

    const childAiProps: JsonObject = {
      ...child,
      parentLogicalId: parentLogicalId,
    };

    if (parentIdKey && typeof child[parentIdKey] !== "string") {
      childAiProps[parentIdKey] = parentLogicalId;
    }

    const childSchema = generateComponentsSchema(childAiProps);
    childSchema.indexNum = index + 1;
    result.push(childSchema);
  }

  return result.length > 0 ? result : undefined;
}

export function generateComponentsSchema(aiProps: JsonObject): ComponentSchema {
  const rawChildren = aiProps.children;
  const aiPropsWithoutChildren: JsonObject = { ...aiProps };
  delete aiPropsWithoutChildren.children;

  const props = generateComponentProps(aiPropsWithoutChildren) as AiComponentProps;
  const definition = getComponentDefinition(props.componentName);

  const schema: ComponentSchema = {
    businessElementId: props.logicalId,
    parentBusinessElementId: props.parentLogicalId,
    businessType: definition.businessType,
    componentName: props.componentName,
    indexNum: 1,
    structVersion: "0.0.2",
    rootFlag: false,
    props,
    displayName: definition.displayName,
    hiddenFlag: {
      type: "literal",
      value: false,
    },
    lockedFlag: false,
    groupFlag: false,
  };

  const children = generateChildSchemas(props.logicalId, rawChildren);
  if (children) {
    schema.children = children;
  }

  return schema;
}

export function generateComponentsSchemas(
  componentsProps: JsonObject[],
): ComponentSchema[] {
  const orderedProps = [...componentsProps].sort((left, right) => {
    const leftIsImage = left.componentName === "SingleImage" && !isContentSingleImageProps(left);
    const rightIsImage = right.componentName === "SingleImage" && !isContentSingleImageProps(right);

    return Number(leftIsImage) - Number(rightIsImage);
  });

  return orderedProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}

export type EditorLayerRole = "content" | "decoration" | "background";

const EDITOR_LAYER_ORDER: Record<EditorLayerRole, number> = {
  content: 0,
  decoration: 1,
  background: 2,
};

const BACKGROUND_EDITOR_NODE_TITLE_PATTERN =
  /背景|底板|底座|底图|底纹|底色|衬底|面板边框|模块边框|卡组边框|边框|background|backdrop|panel[-_ ]?(?:bg|frame)/i;
const BACKGROUND_EDITOR_NODE_ID_PATTERN = /(?:^|[_-])(?:bg|background|backdrop)(?:[_-]|$)/i;

function editorNodeTitle(node: EditorTreeNode): string {
  if (typeof node.title === "string" && node.title.trim() !== "") {
    return node.title;
  }

  return isJsonObject(node.props) && typeof node.props.name === "string"
    ? node.props.name
    : "";
}

export function isEditorLayerRole(value: JsonValue | undefined): value is EditorLayerRole {
  return value === "content" || value === "decoration" || value === "background";
}

export function isContentSingleImageProps(props: JsonObject): boolean {
  return props.layerRole === "content" || props.imageLayerRole === "content";
}

export function isContentSingleImageNode(node: EditorTreeNode): boolean {
  return node.componentName === "SingleImage" && isContentSingleImageProps(node.props);
}

export function editorNodeLayerRole(node: EditorTreeNode): EditorLayerRole {
  if (isJsonObject(node.props)) {
    if (isEditorLayerRole(node.props.layerRole)) {
      return node.props.layerRole;
    }
    if (
      node.componentName === "SingleImage" &&
      (node.props.imageLayerRole === "content" || node.props.imageLayerRole === "background")
    ) {
      return node.props.imageLayerRole;
    }
  }

  const hasBackgroundTitle = BACKGROUND_EDITOR_NODE_TITLE_PATTERN.test(editorNodeTitle(node));
  if (node.componentName === "SingleImage") {
    return "background";
  }
  if (node.componentName === "SvgDecoration") {
    return hasBackgroundTitle || BACKGROUND_EDITOR_NODE_ID_PATTERN.test(node.id)
      ? "background"
      : "decoration";
  }
  if (
    node.componentName === "__Group__" &&
    (hasBackgroundTitle ||
      (Array.isArray(node.children) &&
        node.children.length > 0 &&
        node.children.every((child) => editorNodeLayerRole(child) === "background")))
  ) {
    return "background";
  }
  return "content";
}

function setEditorNodeLayerRole(node: EditorTreeNode, layerRole: EditorLayerRole): void {
  node.props = isJsonObject(node.props) ? node.props : {};
  node.props.layerRole = layerRole;
  if (node.componentName === "SingleImage" && layerRole !== "decoration") {
    node.props.imageLayerRole = layerRole;
  }
}

function componentSchemaLayerRole(schema: ComponentSchema): EditorLayerRole {
  if (isEditorLayerRole(schema.props.layerRole)) {
    return schema.props.layerRole;
  }
  if (
    schema.componentName === "SingleImage" &&
    (schema.props.imageLayerRole === "content" || schema.props.imageLayerRole === "background")
  ) {
    return schema.props.imageLayerRole;
  }
  if (schema.componentName === "SingleImage") {
    return "background";
  }
  return schema.componentName === "SvgDecoration" ? "decoration" : "content";
}

export function sortComponentSchemas(schemas: ComponentSchema[]): ComponentSchema[] {
  const normalized = schemas.map((schema) => {
    const layerRole = componentSchemaLayerRole(schema);
    const props: JsonObject = { ...schema.props, layerRole };
    if (schema.componentName === "SingleImage" && layerRole !== "decoration") {
      props.imageLayerRole = layerRole;
    }
    return { ...schema, props };
  });
  const sorted = normalized.sort((left, right) => {
    return EDITOR_LAYER_ORDER[componentSchemaLayerRole(left)] - EDITOR_LAYER_ORDER[componentSchemaLayerRole(right)];
  });

  return sorted.map((schema, index) => {
    const next: ComponentSchema = { ...schema, indexNum: index + 1 };
    if (Array.isArray(next.children)) {
      next.children = sortComponentSchemas(next.children);
    }
    return next;
  });
}

export function sortEditorTreeChildren(node: EditorTreeNode): EditorTreeNode {
  if (Array.isArray(node.children)) {
    const normalizedChildren = node.children.map(sortEditorTreeChildren);
    node.children = normalizedChildren.sort((left, right) => {
      return EDITOR_LAYER_ORDER[editorNodeLayerRole(left)] - EDITOR_LAYER_ORDER[editorNodeLayerRole(right)];
    });
  }
  setEditorNodeLayerRole(node, editorNodeLayerRole(node));
  return node;
}

export function componentSchemaToEditorNode(
  schema: ComponentSchema,
): EditorComponentNode {
  const node: EditorComponentNode = {
    id: schema.businessElementId,
    componentName: schema.componentName,
    structVersion: schema.structVersion,
    props: schema.props,
    title:
      typeof schema.props.name === "string" && schema.props.name.trim() !== ""
        ? schema.props.name
        : schema.displayName,
    isHidden: schema.hiddenFlag.value,
    isLocked: schema.lockedFlag,
    isGroup: false,
  };

  if (Array.isArray(schema.children)) {
    node.children = schema.children.map(componentSchemaToEditorNode);
  }

  return node;
}
