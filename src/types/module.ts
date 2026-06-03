import type { ComponentSchema, JsonObject, JsonValue } from "./component.js";

export interface ModuleSlotInput {
  componentName: string;
  props?: JsonObject;
  [key: string]: JsonValue | undefined;
}

export interface ModuleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
  position: "absolute";
  zIndex: number;
  [key: string]: JsonValue;
}

export interface ModuleInput {
  moduleName: string;
  logicalId: string;
  parentLogicalId: string;
  style: ModuleStyle;
  title?: string;
  theme?: JsonObject;
  slots: JsonObject;
  [key: string]: JsonValue | undefined;
}

export interface ModuleDefinition {
  moduleName: string;
  displayName: string;
  description: string;
  capability: JsonObject;
  generateSchemas: (input: ModuleInput) => ComponentSchema[];
}

export type SlotValue = JsonValue | undefined;
