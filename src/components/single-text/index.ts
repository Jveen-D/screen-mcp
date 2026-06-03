import { singleTextCapability } from "./capability.js";
import { singleTextDefaultProps } from "./defaultProps.js";
import { normalizeSingleTextProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const singleTextDefinition = {
  componentName: "SingleText",
  displayName: "单行文本",
  businessType: "DASHBOARD",
  defaultProps: singleTextDefaultProps,
  capability: singleTextCapability,
  normalizeProps: normalizeSingleTextProps,
} satisfies ComponentDefinition;
