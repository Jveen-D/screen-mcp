import { scrollListCapability } from "./capability.js";
import { scrollListDefaultProps } from "./defaultProps.js";
import { normalizeScrollListProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const scrollListDefinition = {
  componentName: "ScrollList",
  displayName: "滚动表格",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: scrollListDefaultProps,
  capability: scrollListCapability,
  normalizeProps: normalizeScrollListProps,
} satisfies ComponentDefinition;
