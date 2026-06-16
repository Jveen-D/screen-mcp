import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asIntegerInRange(value: JsonValue | undefined, min: number, max: number, fallback: number): number {
  const num = asNumber(value, fallback);
  return Math.min(Math.max(Math.round(num), min), max);
}

function cloneRows(rows: JsonValue[]): JsonObject[] {
  return rows
    .filter(isJsonObject)
    .map((item) => ({ ...item }));
}

function ensureEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = {
      isShow: false,
      type: "",
    };
    return;
  }

  entryAnimiation.isShow = typeof entryAnimiation.isShow === "boolean" ? entryAnimiation.isShow : false;
  entryAnimiation.type = asString(entryAnimiation.type, "");
}

function normalizeIndicatorData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const decimal = asIntegerInRange(props.decimal, 0, 4, 0);
  const textValue = props.textValue;
  const normalizedValue = asNumber(textValue, 1234);

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

  const fieldList = [
    {
      fieldName: "value",
      fieldDisplayName: "value",
      fieldType: "DECIMAL",
    },
  ];

  chartData.sourceType = "constant";
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: cloneRows(normalizedData as JsonValue[]),
    fieldList,
  };

  chartData.indicator = [
    {
      fieldDataConfig: {
        calculateType: "SUM",
        format: {
          numberFormat: "numerical",
          Millimeter: false,
          accuracy: decimal,
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
}

export function normalizeIndicatorProps(props: JsonObject): JsonObject {
  normalizeIndicatorData(props);
  ensureEntryAnimation(props);
  return props;
}
