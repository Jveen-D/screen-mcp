import { earth3dCapability } from "./capability.js";
import { earth3dDefaultProps } from "./defaultProps.js";
import { normalizeEarth3dProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const earth3dDefinition = {
  componentName: "Earth3D",
  displayName: "3D地球",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: earth3dDefaultProps,
  capability: earth3dCapability,
  normalizeProps: normalizeEarth3dProps,
} satisfies ComponentDefinition;
