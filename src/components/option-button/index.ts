import { optionButtonCapability } from "./capability.js";
import { optionButtonDefaultProps } from "./defaultProps.js";
import { normalizeOptionButtonProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const optionButtonDefinition = {
  componentName: "optionButton",
  displayName: "操作按钮",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: optionButtonDefaultProps,
  capability: optionButtonCapability,
  normalizeProps: normalizeOptionButtonProps,
} satisfies ComponentDefinition;
