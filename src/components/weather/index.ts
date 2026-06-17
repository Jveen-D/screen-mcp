import { weatherCapability } from "./capability.js";
import { weatherDefaultProps } from "./defaultProps.js";
import { normalizeWeatherProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const weatherDefinition = {
  componentName: "Weather",
  displayName: "天气",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: weatherDefaultProps,
  capability: weatherCapability,
  normalizeProps: normalizeWeatherProps,
} satisfies ComponentDefinition;
