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

function normalizeLineSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "line";
      item.left = 0;
      item.top = 0;
      item.right = 0;
      item.bottom = 0;
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

    const markPoint = item.markPoint;
    if (isJsonObject(markPoint)) {
      const mpLabel = markPoint.label;
      if (isJsonObject(mpLabel)) {
        mpLabel.formatter = cleanFormatter(mpLabel.formatter);
      }
      const mpData = markPoint.data;
      if (Array.isArray(mpData)) {
        for (const mpItem of mpData) {
          if (isJsonObject(mpItem)) {
            const mpItemLabel = mpItem.label;
            if (isJsonObject(mpItemLabel)) {
              mpItemLabel.formatter = cleanFormatter(mpItemLabel.formatter);
            }
          }
        }
      }
    }

    const markLine = item.markLine;
    if (isJsonObject(markLine)) {
      const mlLabel = markLine.label;
      if (isJsonObject(mlLabel)) {
        mlLabel.formatter = cleanFormatter(mlLabel.formatter);
      }
      const mlData = markLine.data;
      if (Array.isArray(mlData)) {
        for (const mlItem of mlData) {
          if (isJsonObject(mlItem)) {
            const mlItemLabel = mlItem.label;
            if (isJsonObject(mlItemLabel)) {
              mlItemLabel.formatter = cleanFormatter(mlItemLabel.formatter);
            }
          }
        }
      }
    }
  }
}

function normalizeGrid(option: JsonObject): void {
  const grid = option.grid;
  if (!isJsonObject(grid)) {
    return;
  }

  const top = asNumber(grid.top, 60);
  const right = asNumber(grid.right, 40);
  const bottom = asNumber(grid.bottom, 42);
  const left = asNumber(grid.left, 30);

  grid.top = top;
  grid.right = right;
  grid.bottom = bottom;
  grid.left = left;
}

export function normalizeLineChartProps(props: JsonObject): JsonObject {
  normalizeLineChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeLineSeries(option);
  normalizeAxes(option);
  normalizeLabelFormatters(option);
  normalizeGrid(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  if (
    typeof legend.left === "string" &&
    typeof legend.top === "string"
  ) {
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
