import { liquidFillCapability } from "./capability.js";
import { liquidFillDefaultProps } from "./defaultProps.js";
import { normalizeLiquidFillProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const liquidFillDefinition = {
  componentName: "LiquidFill",
  displayName: "水球图",
  componentType: "chart",
  businessType: "DASHBOARD",
  defaultProps: liquidFillDefaultProps,
  capability: liquidFillCapability,
  normalizeProps: normalizeLiquidFillProps,
} satisfies ComponentDefinition;
