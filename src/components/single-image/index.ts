import { singleImageCapability } from "./capability.js";
import { singleImageDefaultProps } from "./defaultProps.js";
import type { ComponentDefinition } from "../../types/component.js";

export const singleImageDefinition = {
  componentName: "SingleImage",
  displayName: "图片",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: singleImageDefaultProps,
  capability: singleImageCapability,
} satisfies ComponentDefinition;
