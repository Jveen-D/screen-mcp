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

const DEFAULT_INNER_RADIUS = "0%";
const DEFAULT_OUTER_RADIUS = "75%";

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

function normalizeRoseSeries(option: JsonObject): void {
  const series = option.series;
  if (!Array.isArray(series)) {
    return;
  }

  for (const item of series) {
    if (!isJsonObject(item)) {
      continue;
    }

    item.type = "pie";
    item.roseType = "area";
    item.left = 0;
    item.top = 0;
    item.right = 0;
    item.bottom = 0;
    item.center = normalizeStringPair(item.center, ["50%", "50%"]);
    item.radius = normalizeStringPair(item.radius, [
      DEFAULT_INNER_RADIUS,
      DEFAULT_OUTER_RADIUS,
    ]);

    const label = item.label;
    if (isJsonObject(label)) {
      if (typeof label.show !== "boolean") {
        label.show = true;
      }
      if (typeof label.position !== "string") {
        label.position = "outside";
      }
      if (typeof label.fontFamily !== "string") {
        label.fontFamily = "serif";
      }
      if (typeof label.color !== "string") {
        label.color = "#fff";
      }
      if (typeof label.fontSize !== "number") {
        label.fontSize = 12;
      }
      if (typeof label.fontStyle !== "string") {
        label.fontStyle = "normal";
      }
      if (typeof label.fontWeight !== "string") {
        label.fontWeight = "bold";
      }
      if (typeof label.formatter !== "string") {
        label.formatter = "{b}: {d}%";
      }
    } else {
      item.label = {
        show: true,
        formatter: "{b}: {d}%",
        fontFamily: "serif",
        color: "#fff",
        fontSize: 12,
        position: "outside",
        fontStyle: "normal",
        fontWeight: "bold",
      };
    }

    const labelLine = item.labelLine;
    if (isJsonObject(labelLine)) {
      if (typeof labelLine.show !== "boolean") {
        labelLine.show = true;
      }
      if (typeof labelLine.length !== "number") {
        labelLine.length = 10;
      }
      if (typeof labelLine.length2 !== "number") {
        labelLine.length2 = 20;
      }
    } else {
      item.labelLine = {
        show: true,
        length: 10,
        length2: 20,
      };
    }
  }
}

function normalizeRoseChartData(props: JsonObject): void {
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
      value: asNumber(item.value, 0),
    }));

  if (normalizedData.length === 0) {
    chartData.sourceType = "constant";
    return;
  }

  const existingIndicator = Array.isArray(chartData.indicator)
    ? isJsonObject(chartData.indicator[0])
      ? chartData.indicator[0]
      : {}
    : {};
  const existingFieldDataConfig = isJsonObject(existingIndicator.fieldDataConfig)
    ? existingIndicator.fieldDataConfig
    : {};
  const indicatorDisplayName =
    typeof existingFieldDataConfig.chartDisplayName === "string" &&
    existingFieldDataConfig.chartDisplayName.trim() !== "" &&
    existingFieldDataConfig.chartDisplayName !== "value"
      ? existingFieldDataConfig.chartDisplayName
      : "value";

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
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
  };

  chartData.dimension = [
    {
      fieldDataConfig: {
        calculateType: "COUNT",
        chartDisplayName: "name",
      },
      fieldName: "name",
      fieldDisplayName: "name",
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
        chartDisplayName: indicatorDisplayName,
      },
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];

  props.datasource = {
    constantDataType: "table",
    sourceType: "constant",
    constantTableColumns: [
      { type: "string", key: "name" },
      { type: "number", key: "value" },
    ],
    fieldMappings: [
      { key: "name", mapFields: [{ path: "name", label: "name", deleted: false }] },
      { key: "value", mapFields: [{ path: "value", label: "value", deleted: false }] },
    ],
    constantData: normalizedData,
  };
}

export function normalizeRoseChartProps(props: JsonObject): JsonObject {
  normalizeRoseChartData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  delete option.title;
  delete option.dataset;
  normalizeRoseSeries(option);
  normalizeLabelFormatters(option);

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

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
