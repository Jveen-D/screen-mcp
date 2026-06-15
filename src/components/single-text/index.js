import { singleTextCapability } from "./capability.js";
import { singleTextDefaultProps } from "./defaultProps.js";
import { normalizeSingleTextProps } from "./normalize.js";
export const singleTextDefinition = {
    componentName: "SingleText",
    displayName: "单行文本",
    componentType: "base",
    businessType: "DASHBOARD",
    defaultProps: singleTextDefaultProps,
    capability: singleTextCapability,
    normalizeProps: normalizeSingleTextProps,
};
