import { infoPannelCapability } from "./capability.js";
import { infoPannelDefaultProps } from "./defaultProps.js";
import { normalizeInfoPannelProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const infoPannelDefinition = {
  componentName: "GaodeMap-InfoPannel",
  displayName: "信息面板",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: infoPannelDefaultProps,
  capability: infoPannelCapability,
  normalizeProps: normalizeInfoPannelProps,
} satisfies ComponentDefinition;
