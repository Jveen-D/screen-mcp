import { markerCapability } from "./capability.js";
import { markerDefaultProps } from "./defaultProps.js";
import { normalizeMarkerProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const markerDefinition = {
  componentName: "GaodeMap-Marker",
  displayName: "标牌",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: markerDefaultProps,
  capability: markerCapability,
  normalizeProps: normalizeMarkerProps,
} satisfies ComponentDefinition;
