import { polygonCapability } from "./capability.js";
import { polygonDefaultProps } from "./defaultProps.js";
import { normalizePolygonProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const polygonDefinition = {
  componentName: "GaodeMap-Polygon",
  displayName: "多边形",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: polygonDefaultProps,
  capability: polygonCapability,
  normalizeProps: normalizePolygonProps,
} satisfies ComponentDefinition;
