import { circularProgressCapability } from "./capability.js";
import { circularProgressDefaultProps } from "./defaultProps.js";
import { normalizeCircularProgressProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const circularProgressDefinition = {
  componentName: "CircularProgress",
  displayName: "环形进度图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: circularProgressDefaultProps,
  capability: circularProgressCapability,
  normalizeProps: normalizeCircularProgressProps,
} satisfies ComponentDefinition;
