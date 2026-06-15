import { pieChartCapability } from "./capability.js";
import { pieChartDefaultProps } from "./defaultProps.js";
import { normalizePieChartProps } from "./normalize.js";
export const pieChartDefinition = {
    componentName: "PieChart",
    displayName: "饼图",
    componentType: "chart",
    businessType: "DASHBOARD",
    defaultProps: pieChartDefaultProps,
    capability: pieChartCapability,
    normalizeProps: normalizePieChartProps,
};
