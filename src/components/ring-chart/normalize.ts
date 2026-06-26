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

const DEFAULT_INNER_RADIUS = "30%";
const DEFAULT_OUTER_RADIUS = "45%";

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

function percentNumber(value: string): number | undefined {
  const normalized = value.trim().replace(/%$/u, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cappedPercent(value: string, max: number): string {
  const parsed = percentNumber(value);
  if (parsed === undefined || parsed <= max) {
    return value;
  }
  return `${max}%`;
}

function cappedNumber(value: JsonValue | undefined, fallback: number, max: number): number {
  return Math.min(asNumber(value, fallback), max);
}

function chartDataRowCount(props: JsonObject): number {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return 0;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    return 0;
  }

  return constant.data.length;
}

function isZeroRadius(value: string): boolean {
  return value === "0%" || value === "0";
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

function normalizeSideLegendRingLayout(option: JsonObject, style: JsonObject): void {
  const legend = isJsonObject(option.legend) ? option.legend : {};
  if (legend.show === false) {
    return;
  }

  const orient = typeof legend.orient === "string" ? legend.orient : "horizontal";
  const isSideLegend =
    legend.top === "center" &&
    orient === "vertical" &&
    (legend.left === "left" || legend.left === "right");
  if (!isSideLegend) {
    return;
  }

  const width = asNumber(style.width, 0);
  const height = asNumber(style.height, 0);
  const denseSideLegend = width > 0 && height > 0 && (width < 420 || height < 240);
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  const minOuterRadius = denseSideLegend ? 64 : 60;
  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    item.center = normalizeStringPair(item.center, ["50%", "50%"]);
    item.radius = normalizeStringPair(item.radius, [DEFAULT_INNER_RADIUS, DEFAULT_OUTER_RADIUS]);

    const center = item.center as [string, string];
    const radius = item.radius as [string, string];
    if (legend.left === "right") {
      const parsedCenterX = percentNumber(center[0]);
      center[0] = parsedCenterX === undefined ? "40%" : `${Math.min(parsedCenterX, 40)}%`;
    } else {
      const parsedCenterX = percentNumber(center[0]);
      center[0] = parsedCenterX === undefined ? "60%" : `${Math.max(parsedCenterX, 60)}%`;
    }
    radius[1] = `${Math.max(percentNumber(radius[1]) ?? 0, minOuterRadius)}%`;

    const innerRadius = percentNumber(radius[0]);
    const outerRadius = percentNumber(radius[1]);
    if (
      innerRadius !== undefined &&
      outerRadius !== undefined &&
      innerRadius >= outerRadius
    ) {
      radius[0] = `${Math.max(0, outerRadius - 14)}%`;
    }
  }
}

function cleanFormatter(value: unknown): JsonValue {
  if (typeof value !== "string") {
    return value as JsonValue;
  }

  return value.replace(/\\n|\\r|\\t|\n|\r|\t/g, " ");
}

function normalizeLabelFormatters(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    const label = item.label;
    if (isJsonObject(label)) {
      label.formatter = cleanFormatter(label.formatter);
    }
  }
}

function normalizeRingSeries(option: JsonObject): void {
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
      item.radius = normalizeStringPair(item.radius, [
        DEFAULT_INNER_RADIUS,
        DEFAULT_OUTER_RADIUS,
      ]);

      const radius = item.radius as [string, string];
      if (isZeroRadius(radius[0])) {
        radius[0] = DEFAULT_INNER_RADIUS;
      }
      if (isZeroRadius(radius[1])) {
        radius[1] = DEFAULT_OUTER_RADIUS;
      }
    }
  }
}

function normalizeCompactLegendLabelLayout(props: JsonObject): void {
  const style = isJsonObject(props.style) ? props.style : {};
  const height = asNumber(style.height, 0);
  const width = asNumber(style.width, 0);
  if (height <= 0 || width <= 0) {
    return;
  }

  const option = props.option;
  if (!isJsonObject(option)) {
    return;
  }

  const legend = isJsonObject(option.legend) ? option.legend : {};
  if (legend.show === false || legend.top !== "bottom") {
    return;
  }

  const dataCount = chartDataRowCount(props);
  const denseBottomLegend = height < 220 || width < 420 || dataCount >= 5;
  if (!denseBottomLegend) {
    return;
  }
  const multiItemNarrowLegend = dataCount >= 5 || width < 420;

  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  if (multiItemNarrowLegend) {
    legend.offsetY = Math.max(asNumber(legend.offsetY, -2), -2);
    legend.itemGap = cappedNumber(legend.itemGap, 10, 10);
    legend.itemWidth = cappedNumber(legend.itemWidth, 12, 12);
    legend.itemHeight = cappedNumber(legend.itemHeight, 7, 7);
    const textStyle = isJsonObject(legend.textStyle) ? legend.textStyle : {};
    textStyle.fontSize = cappedNumber(textStyle.fontSize, 11, 11);
    legend.textStyle = textStyle;
  }

  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    const label = isJsonObject(item.label) ? item.label : {};
    if (label.show !== true || label.position !== "outside") {
      continue;
    }

    item.center = normalizeStringPair(item.center, ["50%", "50%"]);
    item.radius = normalizeStringPair(item.radius, [
      DEFAULT_INNER_RADIUS,
      DEFAULT_OUTER_RADIUS,
    ]);

    const center = item.center as [string, string];
    const radius = item.radius as [string, string];
    center[1] = cappedPercent(center[1], multiItemNarrowLegend ? 38 : 40);
    radius[1] = cappedPercent(radius[1], multiItemNarrowLegend ? 46 : 54);

    const innerRadius = percentNumber(radius[0]);
    const outerRadius = percentNumber(radius[1]);
    if (
      innerRadius !== undefined &&
      outerRadius !== undefined &&
      innerRadius >= outerRadius
    ) {
      radius[0] = `${Math.max(0, outerRadius - 14)}%`;
    }

    const labelLine = isJsonObject(item.labelLine) ? item.labelLine : {};
    labelLine.show = typeof labelLine.show === "boolean" ? labelLine.show : true;
    labelLine.length = Math.min(asNumber(labelLine.length, 6), 6);
    labelLine.length2 = Math.min(asNumber(labelLine.length2, 4), multiItemNarrowLegend ? 3 : 4);
    item.labelLine = labelLine;

    if (multiItemNarrowLegend) {
      label.fontSize = cappedNumber(label.fontSize, 11, 11);
      if (typeof label.formatter === "string" && /(?:^|[^@])\{c\}/u.test(label.formatter)) {
        label.formatter = "{b}";
      }
      item.label = label;
    }
  }
}

function normalizeRingChartData(props: JsonObject): void {
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

export function normalizeRingChartProps(props: JsonObject): JsonObject {
  normalizeRingChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  delete option.title;
  normalizeRingSeries(option);
  normalizeLabelFormatters(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  normalizeLegendCenterOverlap(legend);
  normalizeSideLegendRingLayout(option, isJsonObject(props.style) ? props.style : {});
  normalizeCompactLegendLabelLayout(props);

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
