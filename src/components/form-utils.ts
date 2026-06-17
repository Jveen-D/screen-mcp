import type { JsonObject, JsonValue } from "../types/component.js";

export function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

export function asNumber(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function applyDefaults(target: JsonObject, defaults: JsonObject): void {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) {
      target[key] = defaults[key] as JsonValue;
    } else if (isJsonObject(target[key]) && isJsonObject(defaults[key])) {
      applyDefaults(target[key] as JsonObject, defaults[key] as JsonObject);
    }
  }
}

export interface SelectOption {
  label: string;
  value: string | number;
}

function normalizeOptionItem(item: JsonValue, index: number): SelectOption {
  if (!isJsonObject(item)) {
    return { label: `选项${index + 1}`, value: String(index + 1) };
  }

  const label = asString(item.label ?? item.name, `选项${index + 1}`);
  const rawValue = item.value ?? item.id ?? String(index + 1);
  const value = typeof rawValue === "number" ? rawValue : asString(rawValue, String(index + 1));

  return { label, value };
}

export function buildSelectDataConfig(
  aiOptions: JsonValue | undefined,
): JsonObject {
  const options: SelectOption[] = Array.isArray(aiOptions)
    ? aiOptions.map(normalizeOptionItem)
    : [
        { label: "选项1", value: "1" },
        { label: "选项2", value: "2" },
        { label: "选项3", value: "3" },
      ];

  const data = options.map((item) => ({
    name: item.label,
    type: "系列",
    value: String(item.value),
  }));

  return {
    sourceType: "constant",
    isPolling: false,
    polling: 3,
    constant: {
      data,
      originalData: data.map((row) => ({ ...row })),
      fieldList: [
        { fieldName: "name", fieldDisplayName: "name", fieldType: "LONGTEXT" },
        { fieldName: "type", fieldDisplayName: "type", fieldType: "LONGTEXT" },
        { fieldName: "value", fieldDisplayName: "value", fieldType: "DECIMAL" },
      ],
    },
    form: { formPermType: "All", formUuid: "", formName: "" },
    api: {
      headers: [],
      processFunction: "function handleResponse (response) { return response }",
      requestBody: "",
      requestParam: [],
      fieldList: [],
      apiUuid: "",
    },
    dimension: [
      {
        fieldDataConfig: { calculateType: "COUNT", chartDisplayName: "name" },
        fieldName: "name",
        fieldDisplayName: "name",
        fieldType: "LONGTEXT",
      },
    ],
    indicator: [
      {
        fieldDataConfig: {
          calculateType: "SUM",
          format: {
            numberFormat: "noFormat",
            Millimeter: false,
            accuracy: 2,
            dataFix: { preFix: "", auFix: "" },
          },
          chartDisplayName: "value",
        },
        fieldName: "value",
        fieldDisplayName: "value",
        fieldType: "DECIMAL",
      },
    ],
  };
}

export function buildDatePickerDataConfig(dateFieldName = "日期选择"): JsonObject {
  const data = [{ [dateFieldName]: "2025-01-01" }];

  return {
    sourceType: "constant",
    isPolling: false,
    polling: 3,
    constant: {
      data,
      originalData: data.map((row) => ({ ...row })),
      fieldList: [
        {
          fieldName: dateFieldName,
          fieldDisplayName: dateFieldName,
          fieldType: "LONGTEXT",
        },
      ],
    },
    form: { formPermType: "All", formUuid: "", formName: "" },
    api: {
      headers: [],
      processFunction: "function handleResponse (response) { return response }",
      requestBody: "",
      requestParam: [],
      fieldList: [],
      apiUuid: "",
    },
    indicator: [
      {
        fieldDataConfig: { chartDisplayName: dateFieldName },
        fieldName: dateFieldName,
        fieldDisplayName: dateFieldName,
        fieldType: "LONGTEXT",
      },
    ],
  };
}

export function buildDateRangePickerDataConfig(): JsonObject {
  return buildEmptyDataConfig();
}

export function buildEmptyDataConfig(): JsonObject {
  return {
    sourceType: "constant",
    isPolling: false,
    polling: 3,
    constant: { data: [], originalData: [], fieldList: [] },
    form: { formPermType: "All", formUuid: "", formName: "" },
    api: {
      headers: [],
      processFunction: "function handleResponse (response) { return response }",
      requestBody: "",
      requestParam: [],
      fieldList: [],
      apiUuid: "",
    },
    indicator: [],
  };
}

export const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

export const DEFAULT_STYLE: JsonObject = {
  position: "absolute",
  left: 100,
  top: 100,
  width: 200,
  height: 48,
  zIndex: 10,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 16,
  color: "rgba(255,255,255,1)",
  textAlign: "left",
  backgroundColor: "transparent",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 1,
};
