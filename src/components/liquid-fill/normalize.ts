import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_RADIUS = "90%";
const DEFAULT_DIRECTION = "left";
const DEFAULT_AMPLITUDE = 50;
const DEFAULT_COLORS = [
  "#88E9FE",
  "#16d4fe",
  "#16d4fe",
  "#f5a623",
  "#b8e986",
  "#f8e71c",
  "#ee6666",
  "#9013fe",
];

const DEFAULT_LABEL: JsonObject = {
  show: true,
  position: "inside",
  fontSize: 35,
  fontFamily: "serif",
  color: "#ffffff",
  insideColor: "#16ecfa",
  fontWeight: "normal",
  fontStyle: "normal",
  formatter: "{c}",
};

const DEFAULT_BACKGROUND_STYLE: JsonObject = {
  show: true,
  borderWidth: 0,
  borderColor: "#16d4fed2",
  color: "#e0f2fd18",
  opacity: 1,
};

const DEFAULT_OUTLINE: JsonObject = {
  show: true,
  borderDistance: 8,
  itemStyle: {
    borderWidth: 4,
    borderColor: "#83a4ca",
    opacity: 0.4,
  },
};

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

function asRadius(value: JsonValue | undefined, fallback: string): string | number {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return fallback;
}

function asBoolean(value: JsonValue | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  const trimmed = typeof color === "string" ? color.trim() : "";
  if (!trimmed) return null;

  // #rgb / #rrggbb
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // rgb(...), rgba(...)
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

function getContrastLabelColor(waveColor: string): string {
  const rgb = parseColorToRgb(waveColor);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function cleanFormatter(value: unknown): JsonValue {
  if (typeof value !== "string") {
    return value as JsonValue;
  }

  return value.replace(/\\n|\\r|\\t|\n|\r|\t/g, " ");
}

function getColorArray(value: JsonValue | undefined): string[] {
  if (!Array.isArray(value)) {
    return DEFAULT_COLORS;
  }

  const colors = value.filter((item): item is string => typeof item === "string");
  return colors.length > 0 ? colors : DEFAULT_COLORS;
}

function applyDefaults(target: JsonObject, defaults: JsonObject): void {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) {
      target[key] = defaults[key] as JsonValue;
    } else if (isJsonObject(target[key]) && isJsonObject(defaults[key])) {
      applyDefaults(target[key] as JsonObject, defaults[key] as JsonObject);
    }
  }
}

function extractChartDisplayName(chartData: JsonObject): string {
  const indicator = chartData.indicator;
  if (!Array.isArray(indicator) || indicator.length === 0) {
    return "value";
  }

  const first = indicator[0];
  if (!isJsonObject(first)) {
    return "value";
  }

  const fieldDataConfig = first.fieldDataConfig;
  if (!isJsonObject(fieldDataConfig)) {
    return "value";
  }

  return asString(fieldDataConfig.chartDisplayName, "value");
}

function normalizeLiquidFillData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const chartDisplayName = extractChartDisplayName(chartData);

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
        chartDisplayName,
      },
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];
}

function normalizeLiquidFillSeries(props: JsonObject, option: JsonObject): void {
  if (!Array.isArray(option.series)) {
    option.series = [];
  }

  const series = option.series;
  if (!isJsonObject(series[0])) {
    series[0] = {};
  }

  const series0 = series[0] as JsonObject;
  series0.type = "liquidFill";
  series0.radius = asRadius(series0.radius, DEFAULT_RADIUS);

  const direction = series0.direction;
  if (direction !== "left" && direction !== "right") {
    series0.direction = DEFAULT_DIRECTION;
  }

  series0.amplitude = asNumber(series0.amplitude, DEFAULT_AMPLITUDE);
  series0.waveAnimation = asBoolean(series0.waveAnimation, true);

  applyDefaults(series0, {
    label: DEFAULT_LABEL,
    backgroundStyle: DEFAULT_BACKGROUND_STYLE,
    outline: DEFAULT_OUTLINE,
  });

  const label = series0.label;
  if (isJsonObject(label)) {
    label.formatter = cleanFormatter(label.formatter);
  }

  const chartData = props.chartData;
  const data =
    isJsonObject(chartData) &&
    isJsonObject(chartData.constant) &&
    Array.isArray(chartData.constant.data)
      ? (chartData.constant.data as JsonValue[])
      : [];

  const colors = getColorArray(option.color);
  series0.data = data.map((item, index) => {
    if (!isJsonObject(item)) {
      return item;
    }

    const cloned = { ...item };
    const itemStyle = isJsonObject(cloned.itemStyle)
      ? ({ ...cloned.itemStyle } as JsonObject)
      : {};
    itemStyle.color = colors[index % colors.length] as JsonValue;
    cloned.itemStyle = itemStyle as JsonValue;
    return cloned as JsonValue;
  });

  // 水波覆盖文字时显示 insideColor；根据波纹亮度自动选择对比色，避免文字被淹没
  if (isJsonObject(label)) {
    const firstData = series0.data[0];
    const firstItemStyle = isJsonObject(firstData) ? firstData.itemStyle : undefined;
    const firstWaveColor = isJsonObject(firstItemStyle) ? firstItemStyle.color : undefined;
    if (typeof firstWaveColor === "string") {
      label.insideColor = getContrastLabelColor(firstWaveColor);
    }
  }
}

export function normalizeLiquidFillProps(props: JsonObject): JsonObject {
  normalizeLiquidFillData(props);

  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  delete option.title;
  delete option.legend;
  delete option.dataset;

  normalizeLiquidFillSeries(props, option);

  return props;
}
