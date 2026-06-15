import { threeDPieChartCapability } from "./capability.js";
import { threeDPieChartDefaultProps } from "./defaultProps.js";
import { normalizeThreeDPieChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const threeDPieChartDefinition = {
  componentName: "ThreeDPieChart",
  displayName: "3D饼图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: threeDPieChartDefaultProps,
  capability: threeDPieChartCapability,
  normalizeProps: normalizeThreeDPieChartProps,
} satisfies ComponentDefinition;
