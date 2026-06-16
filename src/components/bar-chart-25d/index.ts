import { barChart25DCapability } from "./capability.js";
import { barChart25DDefaultProps } from "./defaultProps.js";
import { normalizeBarChart25DProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const barChart25DDefinition = {
  componentName: "BarChart25D",
  displayName: "2.5D 柱状图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: barChart25DDefaultProps,
  capability: barChart25DCapability,
  normalizeProps: normalizeBarChart25DProps,
} satisfies ComponentDefinition;
