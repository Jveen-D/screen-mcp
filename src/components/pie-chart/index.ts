import { pieChartCapability } from "./capability.js";
import { pieChartDefaultProps } from "./defaultProps.js";
import type { ComponentDefinition } from "../../types/component.js";

export const pieChartDefinition = {
  componentName: "PieChart",
  displayName: "饼图",
  businessType: "DASHBOARD",
  defaultProps: pieChartDefaultProps,
  capability: pieChartCapability,
} satisfies ComponentDefinition;
