import { roseChartCapability } from "./capability.js";
import { roseChartDefaultProps } from "./defaultProps.js";
import { normalizeRoseChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const roseChartDefinition = {
  componentName: "RoseChart",
  displayName: "玫瑰图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: roseChartDefaultProps,
  capability: roseChartCapability,
  normalizeProps: normalizeRoseChartProps,
} satisfies ComponentDefinition;
