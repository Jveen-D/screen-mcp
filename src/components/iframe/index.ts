import { iframeCapability } from "./capability.js";
import { iframeDefaultProps } from "./defaultProps.js";
import { normalizeIframeProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const iframeDefinition = {
  componentName: "IFrame",
  displayName: "iframe",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: iframeDefaultProps,
  capability: iframeCapability,
  normalizeProps: normalizeIframeProps,
} satisfies ComponentDefinition;
