import { percentageBarCapability } from "./capability.js";
import { percentageBarDefaultProps } from "./defaultProps.js";
import { normalizePercentageBarProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const percentageBarDefinition = {
  componentName: "PercentageBar",
  displayName: "百分比条",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: percentageBarDefaultProps,
  capability: percentageBarCapability,
  normalizeProps: normalizePercentageBarProps,
} satisfies ComponentDefinition;
