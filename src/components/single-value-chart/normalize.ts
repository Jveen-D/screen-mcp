import type { JsonObject, JsonValue } from "../../types/component.js";

const VALUE_FIELD = "百分比";
const DEFAULT_PERCENT_VALUE = 50.56;

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

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
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

function buildConstantData(percent: number): JsonObject {
  const value = clampPercent(percent);
  return {
    [VALUE_FIELD]: value.toFixed(2),
  };
}

function buildFieldList(): JsonObject[] {
  return [
    {
      fieldName: VALUE_FIELD,
      fieldDisplayName: VALUE_FIELD,
      fieldType: "DECIMAL",
    },
  ];
}

function buildIndicator(): JsonObject[] {
  return [
    {
      fieldName: VALUE_FIELD,
      fieldDisplayName: VALUE_FIELD,
      fieldType: "DECIMAL",
      fieldDataConfig: {
        chartDisplayName: VALUE_FIELD,
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
      },
    },
  ];
}

function normalizeSingleValueChartData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    props.chartData = {
      isPolling: false,
      sourceType: "constant",
      constant: {
        data: [buildConstantData(DEFAULT_PERCENT_VALUE)],
        originalData: [buildConstantData(DEFAULT_PERCENT_VALUE)],
        fieldList: buildFieldList(),
      },
      form: {
        formPermType: "All",
        formUuid: "",
        formName: "",
      },
      api: {
        headers: [],
        processFunction: "function handleResponse (response) { return response }",
        requestBody: "",
        requestParam: [],
        fieldList: [],
        apiUuid: "",
      },
      polling: 3,
      indicator: buildIndicator(),
      dimension: [],
    };
    return;
  }

  const sourceType = chartData.sourceType;
  if (sourceType !== "constant" && sourceType !== "api" && sourceType !== "dataSet" && sourceType !== "form") {
    chartData.sourceType = "constant";
  }

  const percentValue = props.percentValue;
  const hasPercentValue = typeof percentValue === "number" && Number.isFinite(percentValue);
  const normalizedPercent = hasPercentValue ? clampPercent(percentValue) : DEFAULT_PERCENT_VALUE;

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    chartData.constant = {
      data: [buildConstantData(normalizedPercent)],
      originalData: [buildConstantData(normalizedPercent)],
      fieldList: buildFieldList(),
    };
  } else {
    const data = constant.data.filter(isJsonObject);
    const normalizedData: JsonObject[] = data.length > 0 ? data : [{}];

    if (hasPercentValue) {
      normalizedData[0] = {
        ...normalizedData[0],
        [VALUE_FIELD]: normalizedPercent.toFixed(2),
      };
    } else {
      const first = normalizedData[0];
      const firstValue = asNumber(first[VALUE_FIELD], DEFAULT_PERCENT_VALUE);
      normalizedData[0] = {
        ...first,
        [VALUE_FIELD]: clampPercent(firstValue).toFixed(2),
      };
    }

    chartData.constant = {
      ...constant,
      data: normalizedData,
      originalData: normalizedData.map((item) => ({ ...item })),
      fieldList: buildFieldList(),
    };

    if (hasPercentValue || sourceType !== "api" && sourceType !== "dataSet" && sourceType !== "form") {
      chartData.sourceType = "constant";
    }
  }

  chartData.indicator = buildIndicator();
  chartData.dimension = [];
}

function normalizeEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = {
      isShow: false,
      type: "",
    };
    return;
  }

  applyDefaults(entryAnimiation, {
    isShow: false,
    type: "",
  });
}

function normalizeTextStyleDecimal(props: JsonObject): void {
  const textStyle = isJsonObject(props.TextStyle) ? props.TextStyle : {};
  const raw = asNumber(textStyle.fontSizeFractionDecimal, 1);
  textStyle.fontSizeFractionDecimal = Math.min(2, Math.max(0, Math.round(raw)));
  props.TextStyle = textStyle;
}

export function normalizeSingleValueChartProps(props: JsonObject): JsonObject {
  normalizeSingleValueChartData(props);
  normalizeEntryAnimation(props);
  normalizeTextStyleDecimal(props);
  return props;
}
