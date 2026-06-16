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

function normalizeLineHeight(style: JsonObject): void {
  const lineHeight = style.lineHeight;
  if (typeof lineHeight !== "number") {
    style.lineHeight = 1;
    return;
  }

  if (lineHeight <= 0) {
    style.lineHeight = 1;
    return;
  }

  if (lineHeight <= 4) {
    return;
  }

  const fontSize = style.fontSize;
  const normalized =
    typeof fontSize === "number" && fontSize > 0 ? lineHeight / fontSize : 1;

  style.lineHeight = Math.min(Math.max(Number(normalized.toFixed(2)), 1), 2);
}

function normalizeDynamicTextData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const textValue = props.textValue;
  const normalizedValue = asNumber(textValue, 0);

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data
    .filter(isJsonObject)
    .map((item, index) => ({
      value: index === 0 ? normalizedValue : asNumber(item.value, 0),
    }));

  if (normalizedData.length === 0) {
    normalizedData.push({ value: normalizedValue });
  }

  chartData.sourceType = "constant";
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: normalizedData.map((item) => ({ ...item })),
    fieldList: [
      {
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
  };

  chartData.indicator = [
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: 0,
          dataFix: {
            preFix: "",
            auFix: "",
          },
        },
        chartDisplayName: "数值",
      },
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];

  chartData.dimension = [];
}

export function normalizeDynamicTextProps(props: JsonObject): JsonObject {
  normalizeDynamicTextData(props);

  const style = props.style;
  if (isJsonObject(style)) {
    normalizeLineHeight(style);
    if (typeof style.height !== "number") {
      const fontSize = style.fontSize;
      style.height = typeof fontSize === "number" && fontSize > 0 ? fontSize : 32;
    }
  }

  return props;
}
