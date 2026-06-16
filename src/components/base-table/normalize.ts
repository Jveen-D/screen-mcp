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

function asIntegerInRange(value: JsonValue | undefined, min: number, max: number, fallback: number): number {
  const num = asNumber(value, fallback);
  return Math.min(Math.max(Math.round(num), min), max);
}

function isNumberColumn(column: JsonObject): boolean {
  return asString(column.type, "").toLowerCase() === "number";
}

function getFieldType(column: JsonObject): string {
  return isNumberColumn(column) ? "DECIMAL" : "LONGTEXT";
}

function getCalculateType(column: JsonObject): string {
  return isNumberColumn(column) ? "SUM" : "COUNT";
}

function buildIndicator(column: JsonObject): JsonObject {
  const field = asString(column.field, "");
  const label = asString(column.label, field);
  const fieldType = getFieldType(column);
  const calculateType = getCalculateType(column);

  const fieldDataConfig: JsonObject = {
    calculateType,
    chartDisplayName: label,
  };

  if (fieldType === "DECIMAL") {
    fieldDataConfig.format = {
      numberFormat: "numerical",
      Millimeter: false,
      accuracy: asIntegerInRange(column.accuracy, 0, 4, 0),
      dataFix: {
        preFix: "",
        auFix: "",
      },
    };
  }

  return {
    fieldDataConfig,
    fieldName: field,
    fieldDisplayName: field,
    fieldType,
  };
}

function normalizeCellValue(value: JsonValue, column: JsonObject): JsonValue {
  if (isNumberColumn(column)) {
    return asNumber(value, 0);
  }
  return asString(value, "");
}

function buildRow(
  row: JsonObject,
  columns: JsonObject[],
): JsonObject {
  const normalizedRow: JsonObject = {};
  for (const column of columns) {
    const field = asString(column.field, "");
    if (field === "") {
      continue;
    }
    normalizedRow[field] = normalizeCellValue(row[field], column);
  }
  return normalizedRow;
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

function syncColumnsAndData(props: JsonObject): void {
  const rawColumns = props.columns;
  const rawData = props.data;

  if (!Array.isArray(rawColumns) || rawColumns.length === 0 || !Array.isArray(rawData)) {
    return;
  }

  const columns = rawColumns.filter(isJsonObject) as JsonObject[];
  if (columns.length === 0) {
    return;
  }

  const data = rawData.filter(isJsonObject) as JsonObject[];
  const normalizedData = data.map((row) => buildRow(row, columns));

  const indicator = columns.map(buildIndicator);
  const fieldList = columns.map((column) => ({
    fieldName: asString(column.field, ""),
    fieldDisplayName: asString(column.field, ""),
    fieldType: getFieldType(column),
  }));

  const chartData = isJsonObject(props.chartData) ? props.chartData : {};
  const originalChartData = isJsonObject(chartData.constant)
    ? chartData.constant
    : {};

  props.chartData = {
    ...chartData,
    isPolling: typeof chartData.isPolling === "boolean" ? chartData.isPolling : false,
    sourceType: "constant",
    dimension: [],
    indicator,
    constant: {
      ...originalChartData,
      data: normalizedData,
      originalData: cloneRows(normalizedData as JsonValue[]),
      fieldList,
    },
    form: isJsonObject(chartData.form)
      ? chartData.form
      : {
          formPermType: "All",
          formUuid: "",
          formName: "",
        },
    api: isJsonObject(chartData.api)
      ? chartData.api
      : {
          headers: [],
          processFunction: "function handleResponse (response) { return response }",
          requestBody: "",
          requestParam: [],
          fieldList: [],
          apiUuid: "",
        },
    polling: typeof chartData.polling === "number" ? chartData.polling : 3,
  };

  delete props.columns;
  delete props.data;
}

function normalizeExistingChartData(props: JsonObject): void {
  const chartData = props.chartData;
  if (!isJsonObject(chartData)) {
    return;
  }

  const constant = chartData.constant;
  if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
    chartData.sourceType = "constant";
    return;
  }

  const normalizedData = constant.data.filter(isJsonObject);
  if (normalizedData.length === 0) {
    chartData.sourceType = "constant";
    return;
  }

  chartData.sourceType = "constant";
  chartData.dimension = [];
  chartData.constant = {
    ...constant,
    data: normalizedData,
    originalData: cloneRows(normalizedData as JsonValue[]),
  };
}

export function normalizeBaseTableProps(props: JsonObject): JsonObject {
  syncColumnsAndData(props);
  normalizeExistingChartData(props);
  ensureEntryAnimation(props);
  return props;
}
