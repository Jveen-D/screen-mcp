import { radarChartCapability } from "./capability.js";
import { radarChartDefaultProps } from "./defaultProps.js";
import { normalizeRadarChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const radarChartDefinition = {
  componentName: "RadarChart",
  displayName: "雷达图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: radarChartDefaultProps,
  capability: radarChartCapability,
  normalizeProps: normalizeRadarChartProps,
} satisfies ComponentDefinition;
