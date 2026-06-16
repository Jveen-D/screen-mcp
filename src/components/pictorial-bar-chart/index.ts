import { pictorialBarChartCapability } from "./capability.js";
import { pictorialBarChartDefaultProps } from "./defaultProps.js";
import { normalizePictorialBarChartProps } from "./normalize.js";
import type { ComponentDefinition } from "../../types/component.js";

export const pictorialBarChartDefinition = {
  componentName: "PictorialBarChart",
  displayName: "象形柱图",
  componentType: "base",
  businessType: "DASHBOARD",
  defaultProps: pictorialBarChartDefaultProps,
  capability: pictorialBarChartCapability,
  normalizeProps: normalizePictorialBarChartProps,
} satisfies ComponentDefinition;
