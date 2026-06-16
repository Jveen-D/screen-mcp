import { barProgressCapability } from "./capability.js";
import { barProgressDefaultProps } from "./defaultProps.js";
import { normalizeBarProgressProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const barProgressDefinition = {
  componentName: "BarProgress",
  displayName: "条形进度图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: barProgressDefaultProps,
  capability: barProgressCapability,
  normalizeProps: normalizeBarProgressProps,
} satisfies ComponentDefinition;
