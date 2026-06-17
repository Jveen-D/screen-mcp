import { inputCapability } from "./capability.js";
import { inputDefaultProps } from "./defaultProps.js";
import { normalizeInputProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const inputDefinition = {
  componentName: "Input",
  displayName: "输入框",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: inputDefaultProps,
  capability: inputCapability,
  normalizeProps: normalizeInputProps,
} satisfies ComponentDefinition;
