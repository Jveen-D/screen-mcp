import { heatMapCapability } from "./capability.js";
import { heatMapDefaultProps } from "./defaultProps.js";
import { normalizeHeatMapProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const heatMapDefinition = {
  componentName: "HeatMap",
  displayName: "热力图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: heatMapDefaultProps,
  capability: heatMapCapability,
  normalizeProps: normalizeHeatMapProps,
} satisfies ComponentDefinition;
