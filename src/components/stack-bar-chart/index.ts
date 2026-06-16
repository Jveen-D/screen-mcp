import { stackBarChartCapability } from "./capability.js";
import { stackBarChartDefaultProps } from "./defaultProps.js";
import { normalizeStackBarChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const stackBarChartDefinition = {
  componentName: "StackBarChart",
  displayName: "堆叠柱状图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: stackBarChartDefaultProps,
  capability: stackBarChartCapability,
  normalizeProps: normalizeStackBarChartProps,
} satisfies ComponentDefinition;
