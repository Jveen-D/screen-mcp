import { cloneJson, deepMerge, removeAiForbiddenProps } from "./merge.js";
import { getComponentDefinition } from "./registry.js";
import type {
  AiComponentProps,
  ComponentSchema,
  JsonObject,
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

export function generateComponentProps(aiProps: JsonObject): JsonObject {
  const componentName = assertRequiredString(aiProps, "componentName");
  assertRequiredString(aiProps, "logicalId");
  assertRequiredString(aiProps, "parentLogicalId");

  const definition = getComponentDefinition(componentName);
  const sanitizedAiProps = removeAiForbiddenProps(aiProps);
  const mergedProps = deepMerge(definition.defaultProps, sanitizedAiProps);

  mergedProps.chartData = cloneJson(definition.defaultProps.chartData);

  return mergedProps;
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
  return componentsProps.map((props, index) => ({
    ...generateComponentsSchema(props),
    indexNum: index + 1,
  }));
}
