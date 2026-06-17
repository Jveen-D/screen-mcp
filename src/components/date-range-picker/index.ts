import { dateRangePickerCapability } from "./capability.js";
import { dateRangePickerDefaultProps } from "./defaultProps.js";
import { normalizeDateRangePickerProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const dateRangePickerDefinition = {
  componentName: "DateRangePicker",
  displayName: "日期范围选择",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: dateRangePickerDefaultProps,
  capability: dateRangePickerCapability,
  normalizeProps: normalizeDateRangePickerProps,
} satisfies ComponentDefinition;
