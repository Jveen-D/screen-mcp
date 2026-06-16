import { singleValueChartCapability } from "./capability.js";
import { singleValueChartDefaultProps } from "./defaultProps.js";
import { normalizeSingleValueChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const singleValueChartDefinition = {
  componentName: "SingleValueChart",
  displayName: "单值占比图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: singleValueChartDefaultProps,
  capability: singleValueChartCapability,
  normalizeProps: normalizeSingleValueChartProps,
} satisfies ComponentDefinition;
