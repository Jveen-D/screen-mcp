import { gaodeMapCapability } from "./capability.js";
import { gaodeMapDefaultProps } from "./defaultProps.js";
import { normalizeGaodeMapProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const gaodeMapDefinition = {
  componentName: "GaodeMap",
  displayName: "2D高德地图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: gaodeMapDefaultProps,
  capability: gaodeMapCapability,
  normalizeProps: normalizeGaodeMapProps,
} satisfies ComponentDefinition;
