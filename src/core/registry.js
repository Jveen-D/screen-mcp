import { pieChartDefinition } from "../components/pie-chart/index.js";
import { singleImageDefinition } from "../components/single-image/index.js";
import { singleTextDefinition } from "../components/single-text/index.js";
import { svgDecorationDefinition } from "../components/svg-decoration/index.js";
import { threeDPieChartDefinition } from "../components/three-d-pie-chart/index.js";
import { withBaseCapability } from "./baseCapability.js";
const definitions = [
    pieChartDefinition,
    threeDPieChartDefinition,
    singleImageDefinition,
    singleTextDefinition,
    svgDecorationDefinition,
];
export function listComponents() {
    return definitions.map((definition) => ({
        componentName: definition.componentName,
        displayName: definition.displayName,
        componentType: definition.componentType,
        businessType: definition.businessType,
        description: typeof definition.capability.description === "string"
            ? definition.capability.description
            : "",
    }));
}
export function getComponentDefinition(componentName) {
    const definition = definitions.find((item) => item.componentName === componentName);
    if (!definition) {
        throw new Error(`unknown componentName: ${componentName}`);
    }
    return definition;
}
export function getComponentCapability(componentName) {
    return withBaseCapability(getComponentDefinition(componentName));
}
