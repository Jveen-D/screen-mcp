import { selectCapability } from "./capability.js";
import { selectDefaultProps } from "./defaultProps.js";
import { normalizeSelectProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const selectDefinition = {
  componentName: "Select",
  displayName: "下拉选择",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: selectDefaultProps,
  capability: selectCapability,
  normalizeProps: normalizeSelectProps,
} satisfies ComponentDefinition;
