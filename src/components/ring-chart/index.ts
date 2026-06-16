import { ringChartCapability } from "./capability.js";
import { ringChartDefaultProps } from "./defaultProps.js";
import { normalizeRingChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const ringChartDefinition = {
  componentName: "RingChart",
  displayName: "环形图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: ringChartDefaultProps,
  capability: ringChartCapability,
  normalizeProps: normalizeRingChartProps,
} satisfies ComponentDefinition;
