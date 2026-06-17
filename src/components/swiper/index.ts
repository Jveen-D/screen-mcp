import { swiperCapability } from "./capability.js";
import { swiperDefaultProps } from "./defaultProps.js";
import { normalizeSwiperProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const swiperDefinition = {
  componentName: "Swiper",
  displayName: "轮播图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: swiperDefaultProps,
  capability: swiperCapability,
  normalizeProps: normalizeSwiperProps,
} satisfies ComponentDefinition;
