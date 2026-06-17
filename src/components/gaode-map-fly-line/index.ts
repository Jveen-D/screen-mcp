import { flyLineCapability } from "./capability.js";
import { flyLineDefaultProps } from "./defaultProps.js";
import { normalizeFlyLineProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const flyLineDefinition = {
  componentName: "GaodeMap-FlyLine",
  displayName: "飞线",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: flyLineDefaultProps,
  capability: flyLineCapability,
  normalizeProps: normalizeFlyLineProps,
} satisfies ComponentDefinition;
