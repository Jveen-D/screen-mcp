import type { JsonObject } from "../../src/types/component.js";

export function asChartObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function findMainChart(panel: JsonObject): JsonObject {
  const children = Array.isArray(panel.children) ? (panel.children as unknown[]) : [];
  const chartNames = new Set([
    "PieChart",
    "ThreeDPieChart",
    "LineChart",
    "BarChart",
    "RingChart",
    "StackBarChart",
    "StackLineChart",
    "BarChart25D",
    "BarProgress",
    "LiquidFill",
    "RoseChart",
    "ScatterChart",
  ]);
  const found = children.find((item) => {
    const obj = asChartObject(item);
    return typeof obj.componentName === "string" && chartNames.has(obj.componentName);
  });
  return asChartObject(found);
}

export function getBatchChartSeries(panel: JsonObject): JsonObject {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  const series = Array.isArray(option.series) ? option.series : [];
  return asChartObject(series[0]);
}

export function getBatchChartIndicatorName(panel: JsonObject): string | undefined {
  const mainChart = findMainChart(panel);
  const chartData = asChartObject(asChartObject(mainChart.props).chartData);
  const indicator = Array.isArray(chartData.indicator) ? chartData.indicator : [];
  const firstIndicator = asChartObject(indicator[0]);
  return asChartObject(firstIndicator.fieldDataConfig).chartDisplayName as string | undefined;
}

export function hasBatchChartDimension(panel: JsonObject, fieldName: string): boolean {
  const mainChart = findMainChart(panel);
  const chartData = asChartObject(asChartObject(mainChart.props).chartData);
  const dimension = Array.isArray(chartData.dimension) ? chartData.dimension : [];
  return dimension.some((item) => asChartObject(item).fieldName === fieldName);
}

export function hasSideSummaryContainer(panel: JsonObject): boolean {
  const children = Array.isArray(panel.children) ? (panel.children as unknown[]) : [];
  return children.some((item) => {
    const obj = asChartObject(item);
    const props = asChartObject(obj.props);
    const name = props.name;
    return typeof name === "string" && /侧边摘要|侧卡/.test(name);
  });
}

export function getBatchChartAxisType(panel: JsonObject, axis: "xAxis" | "yAxis"): string | undefined {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  return asChartObject(option[axis]).type as string | undefined;
}

export function hasBatchChartLegend(panel: JsonObject): boolean {
  const mainChart = findMainChart(panel);
  const option = asChartObject(asChartObject(mainChart.props).option);
  return option.legend !== undefined && option.legend !== null;
}
