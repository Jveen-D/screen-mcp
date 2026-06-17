export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface ComponentDefinition {
  componentName: string;
  displayName: string;
  componentType: "chart" | "base";
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
  children?: ComponentSchema[];
}

export interface EditorComponentNode {
  id: string;
  componentName: string;
  structVersion: "0.0.2";
  props: JsonObject;
  title: string;
  isHidden: boolean;
  isLocked: boolean;
  isGroup: false;
  children?: EditorTreeNode[];
}

export interface EditorGroupNode {
  id: string;
  componentName: "__Group__";
  structVersion: "0.0.0";
  props: JsonObject;
  title: string;
  isHidden: boolean;
  isLocked: boolean;
  isGroup: true;
  children: EditorTreeNode[];
}

export type EditorTreeNode = EditorComponentNode | EditorGroupNode;
