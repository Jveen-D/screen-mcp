import { lineChartCapability } from "./capability.js";
import { lineChartDefaultProps } from "./defaultProps.js";
import { normalizeLineChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const lineChartDefinition = {
  componentName: "LineChart",
  displayName: "折线图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: lineChartDefaultProps,
  capability: lineChartCapability,
  normalizeProps: normalizeLineChartProps,
} satisfies ComponentDefinition;
