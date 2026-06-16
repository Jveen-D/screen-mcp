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

function asBoolean(value: JsonValue | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_DATASOURCE: JsonObject = {
  sourceType: "constant",
  constantDataType: "table",
  autoRefresh: false,
  constantTableColumns: [
    {
      type: "number",
      key: "value",
    },
  ],
  fieldMappings: [
    {
      key: "value",
      mapFields: [
        {
          path: "value",
        },
      ],
    },
  ],
  constantData: [
    {
      value: 78,
    },
  ],
};

function ensureEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = { ...DEFAULT_ENTRY_ANIMATION };
    return;
  }

  entryAnimiation.isShow = asBoolean(entryAnimiation.isShow, false);
  entryAnimiation.type = asString(entryAnimiation.type, "");
}

function ensureDatasource(props: JsonObject): JsonObject {
  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = { ...DEFAULT_DATASOURCE };
    props.datasource = datasource;
    return datasource;
  }

  datasource.sourceType = "constant";
  datasource.constantDataType = "constantDataType" in datasource
    ? asString(datasource.constantDataType, "table")
    : "table";
  datasource.autoRefresh = asBoolean(datasource.autoRefresh, false);

  if (!Array.isArray(datasource.constantTableColumns)) {
    datasource.constantTableColumns = [
      {
        type: "number",
        key: "value",
      },
    ];
  }

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = [
      {
        key: "value",
        mapFields: [
          {
            path: "value",
          },
        ],
      },
    ];
  }

  if (!Array.isArray(datasource.constantData)) {
    datasource.constantData = [
      {
        value: 78,
      },
    ];
  }

  return datasource;
}

function syncValueToDatasource(props: JsonObject, datasource: JsonObject): void {
  const value = props.value;
  if (value === undefined || value === null) {
    return;
  }

  const normalizedValue = asNumber(value, 78);

  const constantData = datasource.constantData;
  if (!Array.isArray(constantData) || constantData.length === 0) {
    datasource.constantData = [
      {
        value: normalizedValue,
      },
    ];
    return;
  }

  const first = constantData[0];
  if (isJsonObject(first)) {
    first.value = normalizedValue;
  } else {
    constantData[0] = {
      value: normalizedValue,
    };
  }
}

export function normalizeGaugeProps(props: JsonObject): JsonObject {
  ensureEntryAnimation(props);

  const datasource = ensureDatasource(props);
  syncValueToDatasource(props, datasource);

  return props;
}
