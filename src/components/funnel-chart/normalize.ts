import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_DATA: JsonObject[] = [
  { name: "访问", value: 60 },
  { name: "咨询", value: 40 },
  { name: "订单", value: 20 },
  { name: "点击", value: 80 },
  { name: "展现", value: 100 },
];

const DEFAULT_FIELD_MAPPINGS: JsonObject[] = [
  {
    key: "name",
    mapFields: [{ path: "name", label: "name", deleted: false }],
  },
  {
    key: "value",
    mapFields: [{ path: "value", label: "value", deleted: false }],
  },
];

const DEFAULT_CONSTANT_TABLE_COLUMNS: JsonObject[] = [
  { type: "string", key: "name" },
  { type: "number", key: "value" },
];

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_LEGEND_CONFIG: JsonObject = {
  show: true,
  position: {
    top: "bottom",
    left: "center",
  },
  orient: "horizontal",
  icon: "circle",
  titleFontStyle: {
    fontFamily: "Microsoft YaHei",
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  valueFontStyle: {
    fontFamily: "Microsoft YaHei",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "normal",
    fontStyle: "normal",
  },
};

const DEFAULT_LABEL_CONFIG: JsonObject = {
  show: true,
  position: "inside",
  formatter: "{b}: {c}",
  fontFamily: "Microsoft YaHei",
  fontSize: 12,
  color: "#ffffff",
  fontWeight: "normal",
  fontStyle: "normal",
};

const DEFAULT_CENTRAL_LABEL_CONFIG: JsonObject = {
  show: false,
  formatter: "合计\n{c}",
  fontFamily: "Microsoft YaHei",
  fontSize: 16,
  color: "#ffffff",
  fontWeight: "bold",
  fontStyle: "normal",
};

const DEFAULT_BORDER_CONFIG: JsonObject = {
  show: true,
  borderColor: "rgba(255,255,255,0.3)",
  borderWidth: 1,
  borderType: "solid",
};

const DEFAULT_TOOLTIP_CONFIG: JsonObject = {
  show: true,
  backgroundColor: "rgba(3,16,31,0.92)",
  fontFamily: "Microsoft YaHei",
  fontSize: 14,
  color: "#ffffff",
  fontWeight: "normal",
  fontStyle: "normal",
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

function normalizeDataItem(item: JsonValue, index: number): JsonObject {
  if (!isJsonObject(item)) {
    return { name: `层级${index + 1}`, value: 0 };
  }

  const name = asString(item.name, `层级${index + 1}`);
  const value = asNumber(item.value, 0);

  return { name, value };
}

function normalizeConstantData(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_DATA.map((item, index) =>
      normalizeDataItem(item as JsonValue, index),
    );
  }

  return value.map(normalizeDataItem);
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

function cloneArray(items: JsonObject[]): JsonValue {
  return items.map((item) => ({ ...item })) as JsonValue;
}

function normalizeDatasource(props: JsonObject): void {
  const aiData = props.data;
  const normalizedData = normalizeConstantData(
    Array.isArray(aiData) ? aiData : undefined,
  );

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = {};
    props.datasource = datasource;
  }

  datasource.sourceType = "constant";
  datasource.fieldMode = "multiple";
  datasource.constantDataType = "table";

  if (!Array.isArray(datasource.constantTableColumns)) {
    datasource.constantTableColumns = cloneArray(DEFAULT_CONSTANT_TABLE_COLUMNS);
  }

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = cloneArray(DEFAULT_FIELD_MAPPINGS);
  }

  datasource.constantData = normalizedData.map((item) => ({ ...item })) as JsonValue;

  if (Array.isArray(aiData)) {
    props.data = normalizedData.map((item) => ({ ...item })) as JsonValue;
  }
}

function normalizeEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = { ...DEFAULT_ENTRY_ANIMATION };
    return;
  }

  if (typeof entryAnimiation.isShow !== "boolean") {
    entryAnimiation.isShow = DEFAULT_ENTRY_ANIMATION.isShow;
  }
  if (typeof entryAnimiation.type !== "string") {
    entryAnimiation.type = DEFAULT_ENTRY_ANIMATION.type;
  }
}

function normalizeSort(props: JsonObject): void {
  const sort = props.sort;
  if (sort !== "descending" && sort !== "ascending") {
    props.sort = "descending";
  }
}

function normalizeLegendConfig(props: JsonObject): void {
  const legendConfig = props.legendConfig;
  if (!isJsonObject(legendConfig)) {
    props.legendConfig = { ...DEFAULT_LEGEND_CONFIG };
    return;
  }

  applyDefaults(legendConfig, DEFAULT_LEGEND_CONFIG);

  const position = legendConfig.position;
  if (!isJsonObject(position)) {
    legendConfig.position = {
      top: "bottom",
      left: "center",
    } as JsonValue;
  } else {
    if (typeof position.top !== "string" && typeof position.top !== "number") {
      position.top = "bottom";
    }
    if (typeof position.left !== "string" && typeof position.left !== "number") {
      position.left = "center";
    }
  }
}

function normalizeLabelConfig(props: JsonObject): void {
  const labelConfig = props.labelConfig;
  if (!isJsonObject(labelConfig)) {
    props.labelConfig = { ...DEFAULT_LABEL_CONFIG };
    return;
  }

  applyDefaults(labelConfig, DEFAULT_LABEL_CONFIG);
}

function normalizeCentralLabelConfig(props: JsonObject): void {
  const centralLabelConfig = props.centralLabelConfig;
  if (!isJsonObject(centralLabelConfig)) {
    props.centralLabelConfig = { ...DEFAULT_CENTRAL_LABEL_CONFIG };
    return;
  }

  applyDefaults(centralLabelConfig, DEFAULT_CENTRAL_LABEL_CONFIG);
}

function normalizeBorderConfig(props: JsonObject): void {
  const borderConfig = props.borderConfig;
  if (!isJsonObject(borderConfig)) {
    props.borderConfig = { ...DEFAULT_BORDER_CONFIG };
    return;
  }

  applyDefaults(borderConfig, DEFAULT_BORDER_CONFIG);
}

function normalizeTooltipConfig(props: JsonObject): void {
  const tooltipConfig = props.tooltipConfig;
  if (!isJsonObject(tooltipConfig)) {
    props.tooltipConfig = { ...DEFAULT_TOOLTIP_CONFIG };
    return;
  }

  applyDefaults(tooltipConfig, DEFAULT_TOOLTIP_CONFIG);
}

function normalizeCustomSeriesConfigs(props: JsonObject): void {
  const customSeriesConfigs = props.customSeriesConfigs;
  if (!Array.isArray(customSeriesConfigs)) {
    props.customSeriesConfigs = [];
    return;
  }

  props.customSeriesConfigs = customSeriesConfigs
    .filter((item): item is JsonObject => isJsonObject(item))
    .map((item) => ({
      matchSeriesName: asString(item.matchSeriesName, ""),
      customColor: asString(item.customColor, ""),
    })) as JsonValue;
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeFunnelChartProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeEntryAnimation(props);
  normalizeSort(props);
  normalizeLegendConfig(props);
  normalizeLabelConfig(props);
  normalizeCentralLabelConfig(props);
  normalizeBorderConfig(props);
  normalizeTooltipConfig(props);
  normalizeCustomSeriesConfigs(props);
  normalizeEventConfigures(props);

  return props;
}
