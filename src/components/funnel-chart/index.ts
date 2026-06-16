import { funnelChartCapability } from "./capability.js";
import { funnelChartDefaultProps } from "./defaultProps.js";
import { normalizeFunnelChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const funnelChartDefinition = {
  componentName: "FunnelChart",
  displayName: "漏斗图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: funnelChartDefaultProps,
  capability: funnelChartCapability,
  normalizeProps: normalizeFunnelChartProps,
} satisfies ComponentDefinition;
