import { pieChartCapability } from "./capability.js";
import { pieChartDefaultProps } from "./defaultProps.js";
import { normalizePieChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const pieChartDefinition = {
  componentName: "PieChart",
  displayName: "饼图",
  businessType: "DASHBOARD",
  defaultProps: pieChartDefaultProps,
  capability: pieChartCapability,
  normalizeProps: normalizePieChartProps,
} satisfies ComponentDefinition;
