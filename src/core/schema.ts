import { cloneJson, deepMerge, removeAiForbiddenProps } from "./merge.js";
import { getComponentDefinition } from "./registry.js";
import type {
  AiComponentProps,
  ComponentSchema,
  EditorComponentNode,
  JsonObject,
  JsonValue,
} from "../types/component.js";

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

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPieChartDataRows(props: JsonObject): JsonValue[] | undefined {
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
    style.lineHeight = 1;
  }

  if (style.height === undefined && typeof style.fontSize === "number" && style.fontSize > 0) {
    style.height = style.fontSize;
  }

  return nextProps;
}

function applyPieChartDataRows(props: JsonObject, rows: JsonValue[] | undefined): void {
  props.chartData = cloneJson(getComponentDefinition("PieChart").defaultProps.chartData);

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

export function generateComponentProps(aiProps: JsonObject): JsonObject {
  const componentName = assertRequiredString(aiProps, "componentName");
  assertRequiredString(aiProps, "logicalId");
  assertRequiredString(aiProps, "parentLogicalId");

  const definition = getComponentDefinition(componentName);
  const sanitizedAiProps = applySingleTextLineBoxDefaults(
    removeAiForbiddenProps(aiProps, { componentName }),
  );
  const pieChartDataRows =
    componentName === "PieChart" ? getPieChartDataRows(sanitizedAiProps) : undefined;
  const mergeableAiProps =
    componentName === "PieChart" ? removeChartData(sanitizedAiProps) : sanitizedAiProps;
  const mergedProps = deepMerge(definition.defaultProps, mergeableAiProps);

  if (componentName === "PieChart") {
    applyPieChartDataRows(mergedProps, pieChartDataRows);
  } else {
    mergedProps.chartData = cloneJson(definition.defaultProps.chartData);
  }

  return definition.normalizeProps?.(mergedProps) ?? mergedProps;
}

export function generateComponentsSchema(aiProps: JsonObject): ComponentSchema {
  const props = generateComponentProps(aiProps) as AiComponentProps;
  const definition = getComponentDefinition(props.componentName);

  return {
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
}

export function generateComponentsSchemas(
  componentsProps: JsonObject[],
): ComponentSchema[] {
  const orderedProps = [...componentsProps].sort((left, right) => {
    const leftIsImage = left.componentName === "SingleImage";
    const rightIsImage = right.componentName === "SingleImage";

    return Number(leftIsImage) - Number(rightIsImage);
  });

  return orderedProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}

export function componentSchemaToEditorNode(
  schema: ComponentSchema,
): EditorComponentNode {
  return {
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
}
