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

function clampNumber(
  value: JsonValue | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  return Math.min(max, Math.max(min, asNumber(value, fallback)));
}

function asFiniteNumber(value: JsonValue | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
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

function normalizeLineChartData(props: JsonObject): void {
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

function normalizeLineSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "line";
      delete item.left;
      delete item.top;
      delete item.right;
      delete item.bottom;

      const showSymbol = isJsonObject(item.showSymbol)
        ? item.showSymbol.show
        : item.showSymbol;
      item.showSymbol = showSymbol === true;
      item.symbolSize = clampNumber(item.symbolSize, 1, 32, 8);
      item.connectNulls = item.connectNulls === true;
      item.sampling = ["none", "average", "min", "max", "minmax", "sum", "lttb"].includes(
        item.sampling as string,
      )
        ? item.sampling
        : "none";
      item.step = [false, "start", "middle", "end"].includes(item.step as string | false)
        ? item.step
        : false;

      const lineStyle = item.lineStyle;
      if (isJsonObject(lineStyle)) {
        lineStyle.type = ["solid", "dashed", "dotted"].includes(lineStyle.type as string)
          ? lineStyle.type
          : "solid";
      }

      if (item.areaStyle === true) {
        item.areaStyle = { opacity: 1 };
      } else if (isJsonObject(item.areaStyle)) {
        item.areaStyle.opacity = clampNumber(item.areaStyle.opacity, 0, 1, 1);
      } else if (item.areaStyle !== false) {
        delete item.areaStyle;
      }
    }
  }
}

function normalizeAxes(option: JsonObject): void {
  const xAxis = option.xAxis;
  if (isJsonObject(xAxis)) {
    xAxis.type = "category";
    xAxis.boundaryGap = xAxis.boundaryGap === true;
    if (typeof xAxis.show !== "boolean") {
      xAxis.show = true;
    }
    const axisLabel = xAxis.axisLabel;
    if (isJsonObject(axisLabel)) {
      axisLabel.hideOverlap = axisLabel.hideOverlap !== false;
      axisLabel.overflow = ["break", "breakAll", "truncate", "none"].includes(axisLabel.overflow as string)
        ? axisLabel.overflow
        : "truncate";
      axisLabel.width = clampNumber(axisLabel.width, 16, 400, 72);
    }
  }

  const yAxis = option.yAxis;
  if (isJsonObject(yAxis)) {
    yAxis.type = "value";
    yAxis.scale = yAxis.scale === true;
    if (typeof yAxis.show !== "boolean") {
      yAxis.show = true;
    }

    const min = asFiniteNumber(yAxis.min);
    const max = asFiniteNumber(yAxis.max);
    if (min === undefined) {
      delete yAxis.min;
    } else {
      yAxis.min = min;
    }
    if (max === undefined) {
      delete yAxis.max;
    } else {
      yAxis.max = max;
    }
    if (min !== undefined && max !== undefined && min > max) {
      delete yAxis.min;
      delete yAxis.max;
    }
  }
}

function cleanFormatter(value: unknown): JsonValue {
  if (typeof value !== "string") {
    return value as JsonValue;
  }

  return value.replace(/\\n|\\r|\\t|\n|\r|\t/g, " ");
}

function normalizeTooltipFormatter(value: JsonValue): JsonValue {
  return typeof value === "string"
    ? value.replace(/\\r\\n|\\n|\\r|\r\n|\r|\n/g, "<br/>")
    : value;
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
    if (isJsonObject(label) && "formatter" in label) {
      label.formatter = cleanFormatter(label.formatter);
    }

    const markPoint = item.markPoint;
    if (isJsonObject(markPoint)) {
      const mpLabel = markPoint.label;
      if (isJsonObject(mpLabel) && "formatter" in mpLabel) {
        mpLabel.formatter = cleanFormatter(mpLabel.formatter);
      }
      const mpData = markPoint.data;
      if (Array.isArray(mpData)) {
        for (const mpItem of mpData) {
          if (isJsonObject(mpItem)) {
            const mpItemLabel = mpItem.label;
            if (isJsonObject(mpItemLabel) && "formatter" in mpItemLabel) {
              mpItemLabel.formatter = cleanFormatter(mpItemLabel.formatter);
            }
          }
        }
      }
    }

    const markLine = item.markLine;
    if (isJsonObject(markLine)) {
      const mlLabel = markLine.label;
      if (isJsonObject(mlLabel) && "formatter" in mlLabel) {
        mlLabel.formatter = cleanFormatter(mlLabel.formatter);
      }
      const mlData = markLine.data;
      if (Array.isArray(mlData)) {
        for (const mlItem of mlData) {
          if (isJsonObject(mlItem)) {
            const mlItemLabel = mlItem.label;
            if (isJsonObject(mlItemLabel) && "formatter" in mlItemLabel) {
              mlItemLabel.formatter = cleanFormatter(mlItemLabel.formatter);
            }
          }
        }
      }
    }
  }
}

function normalizeGrid(option: JsonObject): void {
  const grid = isJsonObject(option.grid) ? option.grid : {};

  const top = asNumber(grid.top, 40);
  const right = asNumber(grid.right, 16);
  const bottom = asNumber(grid.bottom, 16);
  const left = asNumber(grid.left, 16);

  grid.top = top;
  grid.right = right;
  grid.bottom = bottom;
  grid.left = left;
  grid.containLabel = grid.containLabel !== false;
  option.grid = grid;
}

function normalizeTooltip(option: JsonObject): void {
  const tooltip = option.tooltip;
  if (!isJsonObject(tooltip)) {
    return;
  }

  tooltip.trigger = ["axis", "item", "none"].includes(tooltip.trigger as string)
    ? tooltip.trigger
    : "axis";
  tooltip.confine = tooltip.confine !== false;
  if ("formatter" in tooltip) {
    tooltip.formatter = normalizeTooltipFormatter(tooltip.formatter);
  }

  const axisPointer = tooltip.axisPointer;
  if (!isJsonObject(axisPointer)) {
    return;
  }
  axisPointer.type = ["line", "shadow", "cross", "none"].includes(axisPointer.type as string)
    ? axisPointer.type
    : "line";
  axisPointer.snap = axisPointer.snap === true;
}

function normalizeLegend(option: JsonObject): void {
  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return;
  }

  legend.type = ["plain", "scroll"].includes(legend.type as string)
    ? legend.type
    : "scroll";
  legend.itemGap = clampNumber(legend.itemGap, 0, 64, 16);
  if (
    typeof legend.left !== "string" ||
    typeof legend.top !== "string"
  ) {
    legend.left = "center";
    legend.top = "top";
  }
  if ("offsetX" in legend) {
    legend.offsetX = asNumber(legend.offsetX, 0);
  }
  if ("offsetY" in legend) {
    legend.offsetY = asNumber(legend.offsetY, 0);
  }
}

export function normalizeLineChartProps(props: JsonObject): JsonObject {
  normalizeLineChartData(props);
  normalizeSemanticDimensions(props);
  normalizeIntegerPrecision(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeLineSeries(option);
  normalizeAxes(option);
  normalizeLabelFormatters(option);
  normalizeGrid(option);
  normalizeTooltip(option);
  normalizeLegend(option);
  normalizeSeriesNamesFromData(props, option);

  return props;
}
