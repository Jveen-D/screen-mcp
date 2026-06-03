import { svgDecorationCapability } from "./capability.js";
import { svgDecorationDefaultProps } from "./defaultProps.js";
import { normalizeSvgDecorationProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const svgDecorationDefinition = {
  componentName: "SvgDecoration",
  displayName: "SVG装饰",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: svgDecorationDefaultProps,
  capability: svgDecorationCapability,
  normalizeProps: normalizeSvgDecorationProps,
} satisfies ComponentDefinition;
