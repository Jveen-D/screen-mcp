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

function isValidNumber(value: JsonValue | undefined): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed);
  }

  return false;
}

function normalizeScatterChartData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data.filter(isJsonObject).map((item, index) => {
    const row: JsonObject = {
      x: asNumber(item.x, 0),
      y: asNumber(item.y, 0),
      series: asString(item.series, "默认系列"),
    };

    if (isValidNumber(item.size)) {
      row.size = asNumber(item.size, 0);
    }

    return row;
  });

  if (normalizedData.length === 0) {
    chartData.sourceType = "constant";
    return;
  }

  chartData.sourceType = "constant";
  chartData.dimension = [
    {
      fieldDataConfig: {
        calculateType: "COUNT",
        chartDisplayName: "series",
      },
      fieldName: "series",
      fieldDisplayName: "series",
      fieldType: "LONGTEXT",
    },
  ];
  chartData.indicator = [
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: 2,
          dataFix: {
            preFix: "",
            auFix: "",
          },
        },
        chartDisplayName: "x",
      },
      fieldName: "x",
      fieldDisplayName: "x",
      fieldType: "DECIMAL",
    },
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: 2,
          dataFix: {
            preFix: "",
            auFix: "",
          },
        },
        chartDisplayName: "y",
      },
      fieldName: "y",
      fieldDisplayName: "y",
      fieldType: "DECIMAL",
    },
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: 2,
          dataFix: {
            preFix: "",
            auFix: "",
          },
        },
        chartDisplayName: "size",
      },
      fieldName: "size",
      fieldDisplayName: "size",
      fieldType: "DECIMAL",
    },
  ];
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: normalizedData.map((item) => ({ ...item })),
    fieldList: [
      { fieldName: "x", fieldDisplayName: "x", fieldType: "DECIMAL" },
      { fieldName: "y", fieldDisplayName: "y", fieldType: "DECIMAL" },
      { fieldName: "size", fieldDisplayName: "size", fieldType: "DECIMAL" },
      { fieldName: "series", fieldDisplayName: "series", fieldType: "LONGTEXT" },
    ],
  };

  props.datasource = {
    constantDataType: "table",
    sourceType: "constant",
    constantTableColumns: [
      { type: "number", key: "x" },
      { type: "number", key: "y" },
      { type: "number", key: "size" },
      { type: "string", key: "series" },
    ],
    fieldMappings: [
      { key: "x", mapFields: [{ path: "x", label: "x", deleted: false }] },
      { key: "y", mapFields: [{ path: "y", label: "y", deleted: false }] },
      { key: "size", mapFields: [{ path: "size", label: "size", deleted: false }] },
      { key: "series", mapFields: [{ path: "series", label: "series", deleted: false }] },
    ],
    constantData: normalizedData,
  };
}

function normalizeScatterSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (isJsonObject(item)) {
      item.type = "scatter";
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
    xAxis.type = "value";
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
  }
}

function normalizeGrid(option: JsonObject): void {
  const grid = option.grid;
  if (!isJsonObject(grid)) {
    return;
  }

  const top = asNumber(grid.top, 50);
  const right = asNumber(grid.right, 22);
  const bottom = asNumber(grid.bottom, 38);
  const left = asNumber(grid.left, 30);

  grid.top = top;
  grid.right = right;
  grid.bottom = bottom;
  grid.left = left;
}

export function normalizeScatterChartProps(props: JsonObject): JsonObject {
  normalizeScatterChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  normalizeScatterSeries(option);
  normalizeAxes(option);
  normalizeLabelFormatters(option);
  normalizeGrid(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  if (typeof legend.left === "string" && typeof legend.top === "string") {
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
