import { multiTextCapability } from "./capability.js";
import { multiTextDefaultProps } from "./defaultProps.js";
import { normalizeMultiTextProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const multiTextDefinition = {
  componentName: "MultiText",
  displayName: "多行文本",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: multiTextDefaultProps,
  capability: multiTextCapability,
  normalizeProps: normalizeMultiTextProps,
} satisfies ComponentDefinition;
