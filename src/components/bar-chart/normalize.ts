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

function normalizeOptionalGap(target: JsonObject, key: string, allowNegative: boolean): void {
  if (!(key in target)) {
    return;
  }

  const value = target[key];
  if (typeof value === "number" && Number.isFinite(value) && (allowNegative || value >= 0)) {
    return;
  }
  if (typeof value === "string") {
    const percentage = value.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
    if (percentage && (allowNegative || Number(percentage[1]) >= 0)) {
      target[key] = value.trim();
      return;
    }
  }

  delete target[key];
}

function chartDataRows(props: JsonObject): JsonObject[] {
  const chartData = props.chartData;
  if (!isJsonObject(chartData) || !isJsonObject(chartData.constant)) {
    return [];
  }

  return Array.isArray(chartData.constant.data)
    ? chartData.constant.data.filter(isJsonObject)
    : [];
}

function uniqueBusinessTypes(rows: JsonObject[]): string[] {
  const result: string[] = [];
  for (const row of rows) {
    const type = typeof row.type === "string" ? row.type.trim() : "";
    if (type !== "" && !/^(?:系列|指标值|数值|value)$/iu.test(type) && !result.includes(type)) {
      result.push(type);
    }
  }
  return result;
}

function isGenericSeriesName(value: JsonValue | undefined): boolean {
  if (typeof value !== "string") {
    return true;
  }

  return /^(?:\s*|数值|指标值|value|series|系列\d*)$/iu.test(value.trim());
}

function normalizeIntegerPrecision(props: JsonObject): void {
  const rows = chartDataRows(props);
  if (rows.length === 0 || !rows.every((row) => Number.isInteger(row.value))) {
    return;
  }

  const chartData = props.chartData;
  if (!isJsonObject(chartData) || !Array.isArray(chartData.indicator)) {
    return;
  }

  const indicator = chartData.indicator[0];
  if (!isJsonObject(indicator)) {
    return;
  }

  const fieldDataConfig = isJsonObject(indicator.fieldDataConfig)
    ? indicator.fieldDataConfig
    : {};
  const format = isJsonObject(fieldDataConfig.format) ? fieldDataConfig.format : {};
  format.accuracy = 0;
  fieldDataConfig.format = format;
  indicator.fieldDataConfig = fieldDataConfig;
}

function normalizeSeriesNamesFromData(props: JsonObject, option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  const types = uniqueBusinessTypes(chartDataRows(props));
  if (types.length === 0) {
    return;
  }

  series.forEach((item, index) => {
    if (isJsonObject(item) && isGenericSeriesName(item.name)) {
      item.name = types[Math.min(index, types.length - 1)];
    }
  });
}

function normalizeBarChartData(props: JsonObject): void {
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

function chartDimension(fieldName: "name" | "type"): JsonObject {
  return {
    fieldDataConfig: {
      calculateType: "COUNT",
      chartDisplayName: fieldName,
    },
    fieldName,
    fieldDisplayName: fieldName,
    fieldType: "LONGTEXT",
  };
}

function normalizeSemanticDimensions(props: JsonObject): void {
  const types = uniqueBusinessTypes(chartDataRows(props));
  if (types.length <= 1) {
    return;
  }

  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const existingDimensions = Array.isArray(chartData.dimension)
    ? chartData.dimension.filter(isJsonObject)
    : [];
  const nameDimension = existingDimensions.find((item) => item.fieldName === "name") ?? chartDimension("name");
  const typeDimension = existingDimensions.find((item) => item.fieldName === "type") ?? chartDimension("type");
  const otherDimensions = existingDimensions.filter(
    (item) => item.fieldName !== "name" && item.fieldName !== "type",
  );

  chartData.dimension = [nameDimension, typeDimension, ...otherDimensions];
}

function normalizeBarSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "bar";
      item.left = 0;
      item.top = 0;
      item.right = 0;
      item.bottom = 0;

      normalizeOptionalNumber(item, "barWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMinWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMaxWidth", 0, 200, true);
      normalizeOptionalNumber(item, "barMinHeight", 0, 200);
      normalizeOptionalGap(item, "barGap", true);
      normalizeOptionalGap(item, "barCategoryGap", false);
      normalizeOptionalBoolean(item, "showBackground");

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

      const backgroundStyle = item.backgroundStyle;
      if (isJsonObject(backgroundStyle)) {
        normalizeOptionalNumber(backgroundStyle, "borderWidth", 0, 20);
        normalizeOptionalBorderRadius(backgroundStyle, "borderRadius");
        normalizeOptionalNumber(backgroundStyle, "opacity", 0, 1);
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

  grid.left = asNumber(grid.left, 16);
  grid.right = asNumber(grid.right, 16);
  grid.top = asNumber(grid.top, 40);
  grid.bottom = asNumber(grid.bottom, 16);
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

export function normalizeBarChartProps(props: JsonObject): JsonObject {
  normalizeBarChartData(props);
  normalizeSemanticDimensions(props);
  normalizeIntegerPrecision(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeBarSeries(option);
  normalizeAxes(option);
  normalizeLabelFormatters(option);
  normalizeGrid(option);
  normalizeTooltip(option);
  normalizeLegend(option);
  normalizeBarStyle(option);
  normalizeSeriesNamesFromData(props, option);

  return props;
}
