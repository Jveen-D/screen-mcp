import { dynamicTextCapability } from "./capability.js";
import { dynamicTextDefaultProps } from "./defaultProps.js";
import { normalizeDynamicTextProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const dynamicTextDefinition = {
  componentName: "DynamicText",
  displayName: "动态文本",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: dynamicTextDefaultProps,
  capability: dynamicTextCapability,
  normalizeProps: normalizeDynamicTextProps,
} satisfies ComponentDefinition;
