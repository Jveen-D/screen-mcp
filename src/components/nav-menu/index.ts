import { navMenuCapability } from "./capability.js";
import { navMenuDefaultProps } from "./defaultProps.js";
import { normalizeNavMenuProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const navMenuDefinition = {
  componentName: "NavMenu",
  displayName: "导航菜单",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: navMenuDefaultProps,
  capability: navMenuCapability,
  normalizeProps: normalizeNavMenuProps,
} satisfies ComponentDefinition;
