import { stackLineChartCapability } from "./capability.js";
import { stackLineChartDefaultProps } from "./defaultProps.js";
import { normalizeStackLineChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const stackLineChartDefinition = {
  componentName: "StackLineChart",
  displayName: "堆叠折线图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: stackLineChartDefaultProps,
  capability: stackLineChartCapability,
  normalizeProps: normalizeStackLineChartProps,
} satisfies ComponentDefinition;
