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
import { selectDefinition } from "../components/select/index.js";
import { radioGroupDefinition } from "../components/radio-group/index.js";
import { datePickerDefinition } from "../components/date-picker/index.js";
import { dateRangePickerDefinition } from "../components/date-range-picker/index.js";
import { weatherDefinition } from "../components/weather/index.js";
import { dateDefinition } from "../components/date/index.js";
import { videoDefinition } from "../components/video/index.js";
import { audioDefinition } from "../components/audio/index.js";
import { iframeDefinition } from "../components/iframe/index.js";
import { swiperDefinition } from "../components/swiper/index.js";
import { optionButtonDefinition } from "../components/option-button/index.js";
import { earth3dDefinition } from "../components/earth-3d/index.js";
import { earth3dPointerDefinition } from "../components/earth-3d-pointer/index.js";
import { earth3dSatelliteDefinition } from "../components/earth-3d-satellite/index.js";
import { earth3dSpeedLightDefinition } from "../components/earth-3d-speed-light/index.js";
import { earth3dTextAroundDefinition } from "../components/earth-3d-text-around/index.js";
import { gaodeMapDefinition } from "../components/gaode-map/index.js";
import { flyLineDefinition } from "../components/gaode-map-fly-line/index.js";
import { heatMapDefinition as gaodeHeatMapDefinition } from "../components/gaode-map-heat-map/index.js";
import { infoPannelDefinition } from "../components/gaode-map-info-pannel/index.js";
import { markerDefinition } from "../components/gaode-map-marker/index.js";
import { polygonDefinition } from "../components/gaode-map-polygon/index.js";
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
  selectDefinition,
  radioGroupDefinition,
  datePickerDefinition,
  dateRangePickerDefinition,
  weatherDefinition,
  dateDefinition,
  videoDefinition,
  audioDefinition,
  iframeDefinition,
  swiperDefinition,
  optionButtonDefinition,
  earth3dDefinition,
  earth3dPointerDefinition,
  earth3dSatelliteDefinition,
  earth3dSpeedLightDefinition,
  earth3dTextAroundDefinition,
  gaodeMapDefinition,
  flyLineDefinition,
  gaodeHeatMapDefinition,
  infoPannelDefinition,
  markerDefinition,
  polygonDefinition,
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
