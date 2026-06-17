import { videoCapability } from "./capability.js";
import { videoDefaultProps } from "./defaultProps.js";
import { normalizeVideoProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const videoDefinition = {
  componentName: "Video",
  displayName: "视频",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: videoDefaultProps,
  capability: videoCapability,
  normalizeProps: normalizeVideoProps,
} satisfies ComponentDefinition;
