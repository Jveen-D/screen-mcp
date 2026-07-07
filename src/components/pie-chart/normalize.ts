import type { JsonObject, JsonValue } from "../../types/component.js";

export const legendPositionOptions = [
  ["left", "top"],
  ["center", "top"],
  ["right", "top"],
  ["left", "center"],
  ["right", "center"],
  ["left", "bottom"],
  ["center", "bottom"],
  ["right", "bottom"],
] as const;

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asNumber(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asPercentString(value: JsonValue | undefined, fallback: string): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}%`;
  }

  return fallback;
}

function normalizeStringPair(
  value: JsonValue | undefined,
  fallback: [string, string],
): [string, string] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return [
    asPercentString(value[0], fallback[0]),
    asPercentString(value[1], fallback[1]),
  ];
}

function isValidLegendPosition(left: JsonValue, top: JsonValue): boolean {
  if (typeof left !== "string" || typeof top !== "string") {
    return false;
  }

  return legendPositionOptions.some(
    ([allowedLeft, allowedTop]) => left === allowedLeft && top === allowedTop,
  );
}

function normalizeLegendCenterOverlap(legend: JsonObject): void {
  if (legend.top !== "center") {
    return;
  }

  const orient = typeof legend.orient === "string" ? legend.orient : "horizontal";
  if (orient === "vertical" && (legend.left === "left" || legend.left === "right")) {
    return;
  }

  legend.left = "center";
  legend.top = "bottom";
  legend.orient = "horizontal";
}

function normalizeBottomLegendOffset(legend: JsonObject): void {
  if (legend.show === false || legend.top !== "bottom") {
    return;
  }

  legend.offsetY = Math.min(asNumber(legend.offsetY, 0), 0);
}

function normalizePieSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "pie";
      item.left = 0;
      item.top = 0;
      item.right = 0;
      item.bottom = 0;
      item.center = normalizeStringPair(item.center, ["50%", "50%"]);
      item.radius = normalizeStringPair(item.radius, ["0%", "60%"]);
    }
  }
}

function normalizePieChartData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data
    .filter(isJsonObject)
    .map((item, index) => ({
      name: asString(item.name, `类目${index + 1}`),
      type: asString(item.type, "系列"),
      value: asNumber(item.value, 0),
    }));

  if (normalizedData.length === 0) {
    chartData.sourceType = "constant";
    return;
  }

  chartData.sourceType = "constant";
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: normalizedData.map((item) => ({ ...item })),
    fieldList: [
      {
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      },
      {
        fieldName: "type",
        fieldDisplayName: "type",
        fieldType: "LONGTEXT",
      },
      {
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
  };
}

export function normalizePieChartProps(props: JsonObject): JsonObject {
  normalizePieChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizePieSeries(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  normalizeLegendCenterOverlap(legend);
  normalizeBottomLegendOffset(legend);

  if (isValidLegendPosition(legend.left, legend.top)) {
    legend.offsetX = asNumber(legend.offsetX, 0);
    legend.offsetY = asNumber(legend.offsetY, 0);
    return props;
  }

  legend.left = "center";
  legend.top = "top";
  legend.offsetX = asNumber(legend.offsetX, 0);
  legend.offsetY = asNumber(legend.offsetY, 0);

  return props;
}
