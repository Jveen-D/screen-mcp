import { scatterChartCapability } from "./capability.js";
import { scatterChartDefaultProps } from "./defaultProps.js";
import { normalizeScatterChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const scatterChartDefinition = {
  componentName: "ScatterChart",
  displayName: "散点图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: scatterChartDefaultProps,
  capability: scatterChartCapability,
  normalizeProps: normalizeScatterChartProps,
} satisfies ComponentDefinition;
