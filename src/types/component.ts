export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface ComponentDefinition {
  componentName: string;
  displayName: string;
  businessType: "DASHBOARD";
  defaultProps: JsonObject;
  capability: JsonObject;
  normalizeProps?: (props: JsonObject) => JsonObject;
}

export interface AiComponentProps extends JsonObject {
  componentName: string;
  logicalId: string;
  parentLogicalId: string;
}

export interface ComponentSchema {
  businessElementId: string;
  parentBusinessElementId: string;
  businessType: "DASHBOARD";
  componentName: string;
  indexNum: number;
  structVersion: "0.0.2";
  rootFlag: false;
  props: JsonObject;
  displayName: string;
  hiddenFlag: {
    type: "literal";
    value: false;
  };
  lockedFlag: false;
  groupFlag: false;
}
