import { barChartCapability } from "./capability.js";
import { barChartDefaultProps } from "./defaultProps.js";
import { normalizeBarChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const barChartDefinition = {
  componentName: "BarChart",
  displayName: "柱状图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: barChartDefaultProps,
  capability: barChartCapability,
  normalizeProps: normalizeBarChartProps,
} satisfies ComponentDefinition;
