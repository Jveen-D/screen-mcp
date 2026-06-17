import { earth3dSpeedLightCapability } from "./capability.js";
import { earth3dSpeedLightDefaultProps } from "./defaultProps.js";
import { normalizeEarth3dSpeedLightProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const earth3dSpeedLightDefinition = {
  componentName: "Earth3D-SpeedLight",
  displayName: "扫描线",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: earth3dSpeedLightDefaultProps,
  capability: earth3dSpeedLightCapability,
  normalizeProps: normalizeEarth3dSpeedLightProps,
} satisfies ComponentDefinition;
