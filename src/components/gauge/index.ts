import { gaugeCapability } from "./capability.js";
import { gaugeDefaultProps } from "./defaultProps.js";
import { normalizeGaugeProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const gaugeDefinition = {
  componentName: "Gauge",
  displayName: "仪表盘",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: gaugeDefaultProps,
  capability: gaugeCapability,
  normalizeProps: normalizeGaugeProps,
} satisfies ComponentDefinition;
