import { earth3dTextAroundCapability } from "./capability.js";
import { earth3dTextAroundDefaultProps } from "./defaultProps.js";
import { normalizeEarth3dTextAroundProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const earth3dTextAroundDefinition = {
  componentName: "Earth3D-TextAround",
  displayName: "文字环绕",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: earth3dTextAroundDefaultProps,
  capability: earth3dTextAroundCapability,
  normalizeProps: normalizeEarth3dTextAroundProps,
} satisfies ComponentDefinition;
