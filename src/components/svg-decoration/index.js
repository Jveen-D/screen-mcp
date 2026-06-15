import { svgDecorationCapability } from "./capability.js";
import { svgDecorationDefaultProps } from "./defaultProps.js";
import { normalizeSvgDecorationProps } from "./normalize.js";
export const svgDecorationDefinition = {
    componentName: "SvgDecoration",
    displayName: "SVG装饰",
    componentType: "base",
    businessType: "DASHBOARD",
    defaultProps: svgDecorationDefaultProps,
    capability: svgDecorationCapability,
    normalizeProps: normalizeSvgDecorationProps,
};
