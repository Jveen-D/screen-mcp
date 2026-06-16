import { baseTableCapability } from "./capability.js";
import { baseTableDefaultProps } from "./defaultProps.js";
import { normalizeBaseTableProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const baseTableDefinition = {
  componentName: "BaseTable",
  displayName: "基础表格",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: baseTableDefaultProps,
  capability: baseTableCapability,
  normalizeProps: normalizeBaseTableProps,
} satisfies ComponentDefinition;
