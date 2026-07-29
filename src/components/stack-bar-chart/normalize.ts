import type { JsonObject, JsonValue } from "../../types/component.js";

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeOptionalNumber(
  target: JsonObject,
  key: string,
  min: number,
  max: number,
  allowString = false,
): void {
  if (!(key in target)) {
    return;
  }

  const value = target[key];
  if (allowString && typeof value === "string") {
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    delete target[key];
    return;
  }

  target[key] = clamp(value, min, max);
}

function normalizeOptionalBoolean(target: JsonObject, key: string): void {
  if (key in target && typeof target[key] !== "boolean") {
    delete target[key];
  }
}

function normalizeOptionalEnum(
  target: JsonObject,
  key: string,
  values: string[],
  fallback: string,
): void {
  if (key in target && !values.includes(target[key] as string)) {
    target[key] = fallback;
  }
}

function normalizeOptionalBorderRadius(target: JsonObject, key: string): void {
  if (!(key in target)) {
    return;
  }

  const value = target[key];
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      value.length <= 4 &&
      value.every((item) => typeof item === "number" && Number.isFinite(item))
    ) {
      target[key] = value.map((item) => clamp(item as number, 0, 100));
    } else {
      delete target[key];
    }
    return;
  }

  normalizeOptionalNumber(target, key, 0, 100);
}

function normalizeGapValue(value: JsonValue | undefined): number | string | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  const percentage = normalized.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percentage && Number(percentage[1]) >= 0) {
    return normalized;
  }

  const numericValue = Number(normalized);
  return normalized !== "" && Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : undefined;
}

function normalizeOptionalGap(target: JsonObject, key: string): boolean {
  if (!(key in target)) {
    return false;
  }

  const value = normalizeGapValue(target[key]);
  if (value === undefined) {
    delete target[key];
    return false;
  }

  target[key] = value;
  return true;
}

function normalizeStackBarChartData(props: JsonObject): void {
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

function normalizeStackBarSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "bar";
      item.stack = "__stackBar";
      item.left = 0;
      item.top = 0;
      item.right = 0;
      item.bottom = 0;

      normalizeOptionalNumber(item, "barWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMinWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMaxWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMinHeight", 0, 200);
      if (normalizeOptionalGap(item, "barCategoryGap")) {
        delete item.barWidth;
      }
      normalizeOptionalEnum(item, "stackStrategy", ["samesign", "all", "positive", "negative"], "samesign");

      if (
        typeof item.barMinWidth === "number" &&
        typeof item.barMaxWidth === "number" &&
        item.barMaxWidth < item.barMinWidth
      ) {
        item.barMaxWidth = item.barMinWidth;
      }

      const itemStyle = item.itemStyle;
      if (isJsonObject(itemStyle)) {
        normalizeOptionalNumber(itemStyle, "borderWidth", 0, 20);
        normalizeOptionalBorderRadius(itemStyle, "borderRadius");
      }

      const emphasis = item.emphasis;
      if (isJsonObject(emphasis)) {
        normalizeOptionalEnum(emphasis, "focus", ["none", "series", "self"], "series");
      }

      const labelLayout = item.labelLayout;
      if (isJsonObject(labelLayout)) {
        normalizeOptionalBoolean(labelLayout, "hideOverlap");
      }
    }
  }
}

function normalizeAxes(option: JsonObject): void {
  const xAxis = option.xAxis;
  if (isJsonObject(xAxis)) {
    xAxis.type = "category";
    if (typeof xAxis.show !== "boolean") {
      xAxis.show = true;
    }

    const axisLabel = xAxis.axisLabel;
    if (isJsonObject(axisLabel)) {
      normalizeOptionalBoolean(axisLabel, "hideOverlap");
      normalizeOptionalNumber(axisLabel, "width", 0, 1000);
      normalizeOptionalEnum(axisLabel, "overflow", ["truncate", "break", "breakAll", "none"], "truncate");
    }
  }

  const yAxis = option.yAxis;
  if (isJsonObject(yAxis)) {
    yAxis.type = "value";
    if (typeof yAxis.show !== "boolean") {
      yAxis.show = true;
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

function normalizeGrid(option: JsonObject): void {
  const grid = isJsonObject(option.grid) ? option.grid : {};
  option.grid = grid;

  const top = asNumber(grid.top, 40);
  const right = asNumber(grid.right, 16);
  const bottom = asNumber(grid.bottom, 16);
  const left = asNumber(grid.left, 16);

  grid.top = top;
  grid.right = right;
  grid.bottom = bottom;
  grid.left = left;
  grid.containLabel = typeof grid.containLabel === "boolean" ? grid.containLabel : true;
}

function normalizeTooltip(option: JsonObject): void {
  const tooltip = option.tooltip;
  if (!isJsonObject(tooltip)) {
    return;
  }

  normalizeOptionalNumber(tooltip, "borderWidth", 0, 20);
  const axisPointer = tooltip.axisPointer;
  if (isJsonObject(axisPointer)) {
    normalizeOptionalEnum(axisPointer, "type", ["shadow", "line", "cross", "none"], "shadow");
  }
}

function normalizeLegend(option: JsonObject): void {
  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return;
  }

  normalizeOptionalNumber(legend, "itemWidth", 0, 100);
  normalizeOptionalNumber(legend, "itemHeight", 0, 100);
  normalizeOptionalNumber(legend, "itemGap", 0, 200);

  if (typeof legend.left !== "string" || typeof legend.top !== "string") {
    legend.left = "center";
    legend.top = "top";
  }
  legend.offsetX = asNumber(legend.offsetX, 0);
  legend.offsetY = asNumber(legend.offsetY, 0);
}

function normalizeBarStyle(option: JsonObject): void {
  const barStyle = option.barStyle;
  if (!isJsonObject(barStyle)) {
    return;
  }

  barStyle.gradient = typeof barStyle.gradient === "boolean" ? barStyle.gradient : false;
  const darken = barStyle.gradientDarken;
  barStyle.gradientDarken =
    typeof darken === "number" && Number.isFinite(darken) ? clamp(darken, 0, 0.5) : 0.12;
}

export function normalizeStackBarChartProps(props: JsonObject): JsonObject {
  normalizeStackBarChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeStackBarSeries(option);
  normalizeAxes(option);
  normalizeLabelFormatters(option);
  normalizeGrid(option);
  normalizeTooltip(option);
  normalizeLegend(option);
  normalizeBarStyle(option);

  return props;
}
