import { indicatorCapability } from "./capability.js";
import { indicatorDefaultProps } from "./defaultProps.js";
import { normalizeIndicatorProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const indicatorDefinition = {
  componentName: "Indicator",
  displayName: "翻牌器",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: indicatorDefaultProps,
  capability: indicatorCapability,
  normalizeProps: normalizeIndicatorProps,
} satisfies ComponentDefinition;
