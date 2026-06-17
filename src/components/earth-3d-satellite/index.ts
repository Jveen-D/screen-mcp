import { earth3dSatelliteCapability } from "./capability.js";
import { earth3dSatelliteDefaultProps } from "./defaultProps.js";
import { normalizeEarth3dSatelliteProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const earth3dSatelliteDefinition = {
  componentName: "Earth3D-Satellite",
  displayName: "卫星",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: earth3dSatelliteDefaultProps,
  capability: earth3dSatelliteCapability,
  normalizeProps: normalizeEarth3dSatelliteProps,
} satisfies ComponentDefinition;
