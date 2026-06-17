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
import { multiTextDefinition } from "../components/multi-text/index.js";
import { dynamicTextDefinition } from "../components/dynamic-text/index.js";
import { svgDecorationDefinition } from "../components/svg-decoration/index.js";
import { threeDPieChartDefinition } from "../components/three-d-pie-chart/index.js";
import { indicatorDefinition } from "../components/indicator/index.js";
import { gaugeDefinition } from "../components/gauge/index.js";
import { circularProgressDefinition } from "../components/circular-progress/index.js";
import { percentageBarDefinition } from "../components/percentage-bar/index.js";
import { singleValueChartDefinition } from "../components/single-value-chart/index.js";
import { baseTableDefinition } from "../components/base-table/index.js";
import { scrollListDefinition } from "../components/scroll-list/index.js";
import { funnelChartDefinition } from "../components/funnel-chart/index.js";
import { radarChartDefinition } from "../components/radar-chart/index.js";
import { heatMapDefinition } from "../components/heat-map/index.js";
import { pictorialBarChartDefinition } from "../components/pictorial-bar-chart/index.js";
import { navMenuDefinition } from "../components/nav-menu/index.js";
import { tabMenuDefinition } from "../components/tab-menu/index.js";
import { inputDefinition } from "../components/input/index.js";
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
  multiTextDefinition,
  dynamicTextDefinition,
  svgDecorationDefinition,
  indicatorDefinition,
  gaugeDefinition,
  circularProgressDefinition,
  percentageBarDefinition,
  singleValueChartDefinition,
  baseTableDefinition,
  scrollListDefinition,
  funnelChartDefinition,
  radarChartDefinition,
  heatMapDefinition,
  pictorialBarChartDefinition,
  navMenuDefinition,
  tabMenuDefinition,
  inputDefinition,
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
