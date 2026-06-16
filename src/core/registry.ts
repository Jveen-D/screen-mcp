import { pieChartDefinition } from "../components/pie-chart/index.js";
import { lineChartDefinition } from "../components/line-chart/index.js";
import { barChartDefinition } from "../components/bar-chart/index.js";
import { ringChartDefinition } from "../components/ring-chart/index.js";
import { stackBarChartDefinition } from "../components/stack-bar-chart/index.js";
import { stackLineChartDefinition } from "../components/stack-line-chart/index.js";
import { barChart25DDefinition } from "../components/bar-chart-25d/index.js";
import { barProgressDefinition } from "../components/bar-progress/index.js";
import { liquidFillDefinition } from "../components/liquid-fill/index.js";
import { roseChartDefinition } from "../components/rose-chart/index.js";
import { scatterChartDefinition } from "../components/scatter-chart/index.js";
import { singleImageDefinition } from "../components/single-image/index.js";
import { singleTextDefinition } from "../components/single-text/index.js";
import { svgDecorationDefinition } from "../components/svg-decoration/index.js";
import { threeDPieChartDefinition } from "../components/three-d-pie-chart/index.js";
import { withBaseCapability } from "./baseCapability.js";
import type { ComponentDefinition } from "../types/component.js";

const definitions = [
  pieChartDefinition,
  threeDPieChartDefinition,
  lineChartDefinition,
  barChartDefinition,
  ringChartDefinition,
  stackBarChartDefinition,
  stackLineChartDefinition,
  barChart25DDefinition,
  barProgressDefinition,
  liquidFillDefinition,
  roseChartDefinition,
  scatterChartDefinition,
  singleImageDefinition,
  singleTextDefinition,
  svgDecorationDefinition,
] satisfies ComponentDefinition[];

export function listComponents() {
  return definitions.map((definition) => ({
    componentName: definition.componentName,
    displayName: definition.displayName,
    componentType: definition.componentType,
    businessType: definition.businessType,
    description:
      typeof definition.capability.description === "string"
        ? definition.capability.description
        : "",
  }));
}

export function getComponentDefinition(componentName: string): ComponentDefinition {
  const definition = definitions.find(
    (item) => item.componentName === componentName,
  );

  if (!definition) {
    throw new Error(`unknown componentName: ${componentName}`);
  }

  return definition;
}

export function getComponentCapability(componentName: string) {
  return withBaseCapability(getComponentDefinition(componentName));
}
