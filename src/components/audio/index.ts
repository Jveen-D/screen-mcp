import { audioCapability } from "./capability.js";
import { audioDefaultProps } from "./defaultProps.js";
import { normalizeAudioProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const audioDefinition = {
  componentName: "Audio",
  displayName: "音频",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: audioDefaultProps,
  capability: audioCapability,
  normalizeProps: normalizeAudioProps,
} satisfies ComponentDefinition;
