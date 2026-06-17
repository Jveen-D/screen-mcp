import { dateCapability } from "./capability.js";
import { dateDefaultProps } from "./defaultProps.js";
import { normalizeDateProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const dateDefinition = {
  componentName: "Date",
  displayName: "时间",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: dateDefaultProps,
  capability: dateCapability,
  normalizeProps: normalizeDateProps,
} satisfies ComponentDefinition;
