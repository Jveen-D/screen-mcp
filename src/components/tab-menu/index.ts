import { tabMenuCapability } from "./capability.js";
import { tabMenuDefaultProps } from "./defaultProps.js";
import { normalizeTabMenuProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const tabMenuDefinition = {
  componentName: "TabMenu",
  displayName: "Tab列表",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: tabMenuDefaultProps,
  capability: tabMenuCapability,
  normalizeProps: normalizeTabMenuProps,
} satisfies ComponentDefinition;
