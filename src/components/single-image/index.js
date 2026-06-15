import { singleImageCapability } from "./capability.js";
import { singleImageDefaultProps } from "./defaultProps.js";
import { normalizeSingleImageProps } from "./normalize.js";
export const singleImageDefinition = {
    componentName: "SingleImage",
    displayName: "图片",
    componentType: "base",
    businessType: "DASHBOARD",
    defaultProps: singleImageDefaultProps,
    capability: singleImageCapability,
    normalizeProps: normalizeSingleImageProps,
};
