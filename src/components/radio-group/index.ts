import { radioGroupCapability } from "./capability.js";
import { radioGroupDefaultProps } from "./defaultProps.js";
import { normalizeRadioGroupProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const radioGroupDefinition = {
  componentName: "RadioGroup",
  displayName: "单选组",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: radioGroupDefaultProps,
  capability: radioGroupCapability,
  normalizeProps: normalizeRadioGroupProps,
} satisfies ComponentDefinition;
