import { datePickerCapability } from "./capability.js";
import { datePickerDefaultProps } from "./defaultProps.js";
import { normalizeDatePickerProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const datePickerDefinition = {
  componentName: "DatePicker",
  displayName: "日期选择",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: datePickerDefaultProps,
  capability: datePickerCapability,
  normalizeProps: normalizeDatePickerProps,
} satisfies ComponentDefinition;
