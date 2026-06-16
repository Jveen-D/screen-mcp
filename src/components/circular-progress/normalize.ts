import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_DATA: JsonObject[] = [
  { name: "系列1", value: 20 },
  { name: "系列2", value: 50 },
  { name: "系列3", value: 70 },
];

const DEFAULT_FIELD_MAPPINGS: JsonObject[] = [
  {
    key: "seriesName",
    mapFields: [{ path: "name", label: "name", deleted: false }],
  },
  {
    key: "value",
    mapFields: [{ path: "value", label: "value", deleted: false }],
  },
];

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_BASE_SERIES_CONFIG: JsonObject = {
  maxValue: 100,
  minRadius: 50,
  gap: 10,
  roundCap: true,
  clockwise: true,
  trackColor: "rgba(255,255,255,0.12)",
  showLabel: true,
  labelColor: "#ffffff",
  labelFontSize: 14,
  labelFontFamily: "Microsoft YaHei",
  labelFontWeight: "normal",
  labelFontStyle: "normal",
  labelShowSeriesName: true,
  precision: 0,
  suffix: "%",
  labelHelpLineColor: "rgba(255,255,255,0.3)",
  labelHelpLineWidth: 1,
  shadowColor: "transparent",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
};

const DEFAULT_LEGEND_CONFIG: JsonObject = {
  show: true,
  position: {
    top: "bottom",
    left: "center",
  },
  orient: "horizontal",
  icon: "circle",
  fontFamily: "Microsoft YaHei",
  fontSize: 12,
  color: "#ffffff",
  fontWeight: "normal",
  fontStyle: "normal",
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

const DEFAULT_ANIMATION_CONFIG: JsonObject = {
  show: true,
  duration: 1000,
  closeAnimationOnDesignMode: true,
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
    return { name: `系列${index + 1}`, value: 0 };
  }

  const name = asString(item.name, `系列${index + 1}`);
  const value = asNumber(item.value, 0);

  return { name, value };
}

function normalizeConstantData(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_DATA.map((item, index) => normalizeDataItem(item as JsonValue, index));
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

function normalizeDatasource(props: JsonObject): void {
  const aiData = props.data;
  const normalizedData = normalizeConstantData(Array.isArray(aiData) ? aiData : undefined);

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = {};
    props.datasource = datasource;
  }

  datasource.sourceType = "constant";
  datasource.fieldMode = "multiple";
  datasource.autoRefresh = typeof datasource.autoRefresh === "boolean" ? datasource.autoRefresh : false;

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = DEFAULT_FIELD_MAPPINGS.map((item) => ({ ...item })) as JsonValue;
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

function normalizeBaseSeriesConfig(props: JsonObject): void {
  const baseSeriesConfig = props.baseSeriesConfig;
  if (!isJsonObject(baseSeriesConfig)) {
    props.baseSeriesConfig = { ...DEFAULT_BASE_SERIES_CONFIG };
    return;
  }

  applyDefaults(baseSeriesConfig, DEFAULT_BASE_SERIES_CONFIG);
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

function normalizeTooltipConfig(props: JsonObject): void {
  const tooltipConfig = props.tooltipConfig;
  if (!isJsonObject(tooltipConfig)) {
    props.tooltipConfig = { ...DEFAULT_TOOLTIP_CONFIG };
    return;
  }

  applyDefaults(tooltipConfig, DEFAULT_TOOLTIP_CONFIG);
}

function normalizeAnimationConfig(props: JsonObject): void {
  const animationConfig = props.animationConfig;
  if (!isJsonObject(animationConfig)) {
    props.animationConfig = { ...DEFAULT_ANIMATION_CONFIG };
    return;
  }

  applyDefaults(animationConfig, DEFAULT_ANIMATION_CONFIG);
}

function normalizeCustomSeriesConfigs(props: JsonObject): void {
  const customSeriesConfigs = props.customSeriesConfigs;
  if (!Array.isArray(customSeriesConfigs)) {
    props.customSeriesConfigs = [];
  }
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeCircularProgressProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeEntryAnimation(props);
  normalizeBaseSeriesConfig(props);
  normalizeLegendConfig(props);
  normalizeTooltipConfig(props);
  normalizeAnimationConfig(props);
  normalizeCustomSeriesConfigs(props);
  normalizeEventConfigures(props);

  return props;
}
