import { earth3dPointerCapability } from "./capability.js";
import { earth3dPointerDefaultProps } from "./defaultProps.js";
import { normalizeEarth3dPointerProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const earth3dPointerDefinition = {
  componentName: "Earth3D-Pointer",
  displayName: "标记点",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: earth3dPointerDefaultProps,
  capability: earth3dPointerCapability,
  normalizeProps: normalizeEarth3dPointerProps,
} satisfies ComponentDefinition;
