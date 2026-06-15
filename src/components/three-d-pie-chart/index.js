import { threeDPieChartCapability } from "./capability.js";
import { threeDPieChartDefaultProps } from "./defaultProps.js";
import { normalizeThreeDPieChartProps } from "./normalize.js";
export const threeDPieChartDefinition = {
    componentName: "ThreeDPieChart",
    displayName: "3D饼图",
    componentType: "chart",
    businessType: "DASHBOARD",
    defaultProps: threeDPieChartDefaultProps,
    capability: threeDPieChartCapability,
    normalizeProps: normalizeThreeDPieChartProps,
};
