import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_DATA: JsonObject[] = [
  { s: "系列一", x: "维度一", y: 12 },
  { s: "系列一", x: "维度二", y: 14 },
  { s: "系列一", x: "维度三", y: 8 },
  { s: "系列二", x: "维度一", y: 16 },
  { s: "系列二", x: "维度二", y: 10 },
  { s: "系列二", x: "维度三", y: 18 },
];

const DEFAULT_FIELD_MAPPINGS: JsonObject[] = [
  {
    key: "series",
    mapFields: [{ path: "s", label: "s", deleted: false }],
  },
  {
    key: "value",
    mapFields: [{ path: "y", label: "y", deleted: false }],
  },
  {
    key: "dimension",
    mapFields: [{ path: "x", label: "x", deleted: false }],
  },
];

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_MARGIN: JsonObject = {
  top: 50,
  left: 50,
  bottom: 50,
  right: 120,
};

const DEFAULT_LEGEND_CONF: JsonObject = {
  show: true,
  position: {
    top: "top",
    left: "right",
  },
  orient: "vertical",
  icon: "circle",
  font: {
    fontFamily: "Microsoft YaHei",
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "normal",
    fontStyle: "normal",
  },
};

const DEFAULT_AXIS_CONF: JsonObject = {
  show: true,
  centerX: 0.5,
  centerY: 0.5,
  radius: 0.35,
  shape: "polygon",
  axisLineColor: "rgba(255,255,255,0.3)",
  axisLineWidth: 1,
  splitLineShow: true,
  splitLineColor: "rgba(255,255,255,0.12)",
  splitLineWidth: 1,
  splitLineType: "solid",
  splitAreaShow: true,
  splitAreaColor: ["rgba(0,0,0,0)", "rgba(255,255,255,0.05)"],
};

const DEFAULT_LABEL_CONF: JsonObject = {
  show: true,
  color: "#ffffff",
  fontSize: 12,
  fontFamily: "Microsoft YaHei",
  fontWeight: "normal",
  fontStyle: "normal",
  distance: 12,
};

const DEFAULT_TICK_CONF: JsonObject = {
  show: true,
  count: 5,
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontFamily: "Microsoft YaHei",
  fontWeight: "normal",
  fontStyle: "normal",
};

const DEFAULT_SERIES_CONF: JsonObject = {
  matchName: "",
  lineColor: "#00E5FF",
  fillColor: "rgba(0,229,255,0.2)",
  lineWidth: 2,
  symbol: "circle",
  symbolSize: 4,
  areaFill: true,
};

const DEFAULT_SERIES_CONFS: JsonObject[] = [
  {
    matchName: "系列一",
    lineColor: "#00E5FF",
    fillColor: "rgba(0,229,255,0.2)",
    lineWidth: 2,
    symbol: "circle",
    symbolSize: 4,
    areaFill: true,
  },
  {
    matchName: "系列二",
    lineColor: "#FFB300",
    fillColor: "rgba(255,179,0,0.2)",
    lineWidth: 2,
    symbol: "circle",
    symbolSize: 4,
    areaFill: true,
  },
];

const DEFAULT_TOOLTIP_CONF: JsonObject = {
  show: true,
  backgroundColor: "rgba(3,16,31,0.92)",
  fontFamily: "Microsoft YaHei",
  fontSize: 14,
  color: "#ffffff",
  fontWeight: "normal",
  fontStyle: "normal",
};

const DEFAULT_VALUE_LABEL_CONF: JsonObject = {
  show: true,
  color: "#ffffff",
  fontSize: 11,
  fontFamily: "Microsoft YaHei",
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

function normalizeAiDataItem(item: JsonValue, index: number): JsonObject {
  if (!isJsonObject(item)) {
    return { s: `系列${index + 1}`, x: `维度${index + 1}`, y: 0 };
  }

  const series = asString(
    item.series ?? item.s,
    asString(item.type, `系列${index + 1}`),
  );
  const dimension = asString(
    item.dimension ?? item.x,
    asString(item.name, `维度${index + 1}`),
  );
  const value = asNumber(item.value ?? item.y, 0);

  return { s: series, x: dimension, y: value };
}

function normalizeConstantData(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_DATA.map((item, index) => normalizeAiDataItem(item as JsonValue, index));
  }

  return value.map(normalizeAiDataItem);
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
    datasource.fieldMappings = DEFAULT_FIELD_MAPPINGS.map((item) => ({
      key: item.key,
      mapFields: (item.mapFields as JsonValue[]).map((field) => ({ ...field as JsonObject })),
    })) as JsonValue;
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

function normalizeMargin(props: JsonObject): void {
  const margin = props.margin;
  if (!isJsonObject(margin)) {
    props.margin = { ...DEFAULT_MARGIN };
    return;
  }

  applyDefaults(margin, DEFAULT_MARGIN);
}

function normalizeNumericProps(props: JsonObject): void {
  props.min = asNumber(props.min, 0);
  props.max = asNumber(props.max, 20);
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
}

function normalizeLegendConf(props: JsonObject): void {
  const legendConf = props.legendConf;
  if (!isJsonObject(legendConf)) {
    props.legendConf = { ...DEFAULT_LEGEND_CONF };
    return;
  }

  applyDefaults(legendConf, DEFAULT_LEGEND_CONF);

  const position = legendConf.position;
  if (!isJsonObject(position)) {
    legendConf.position = {
      top: "top",
      left: "right",
    } as JsonValue;
  } else {
    if (typeof position.top !== "string" && typeof position.top !== "number") {
      position.top = "top";
    }
    if (typeof position.left !== "string" && typeof position.left !== "number") {
      position.left = "right";
    }
  }

  if (legendConf.orient !== "horizontal" && legendConf.orient !== "vertical") {
    legendConf.orient = DEFAULT_LEGEND_CONF.orient;
  }
}

function normalizeAxisConf(props: JsonObject): void {
  const axisConf = props.axisConf;
  if (!isJsonObject(axisConf)) {
    props.axisConf = { ...DEFAULT_AXIS_CONF };
    return;
  }

  applyDefaults(axisConf, DEFAULT_AXIS_CONF);

  if (axisConf.shape !== "polygon" && axisConf.shape !== "circle") {
    axisConf.shape = DEFAULT_AXIS_CONF.shape;
  }
}

function normalizeLabelConf(props: JsonObject): void {
  const labelConf = props.labelConf;
  if (!isJsonObject(labelConf)) {
    props.labelConf = { ...DEFAULT_LABEL_CONF };
    return;
  }

  applyDefaults(labelConf, DEFAULT_LABEL_CONF);
}

function normalizeTickConf(props: JsonObject): void {
  const tickConf = props.tickConf;
  if (!isJsonObject(tickConf)) {
    props.tickConf = { ...DEFAULT_TICK_CONF };
    return;
  }

  applyDefaults(tickConf, DEFAULT_TICK_CONF);
}

function normalizeSeriesConf(props: JsonObject): void {
  const seriesConf = props.seriesConf;
  if (!Array.isArray(seriesConf) || seriesConf.length === 0) {
    props.seriesConf = DEFAULT_SERIES_CONFS.map((item) => ({ ...item }));
    return;
  }

  props.seriesConf = seriesConf.map((item) => {
    if (!isJsonObject(item)) {
      return { ...DEFAULT_SERIES_CONF };
    }
    return { ...DEFAULT_SERIES_CONF, ...item };
  }) as JsonValue;
}

function normalizeTooltipConf(props: JsonObject): void {
  const tooltipConf = props.tooltipConf;
  if (!isJsonObject(tooltipConf)) {
    props.tooltipConf = { ...DEFAULT_TOOLTIP_CONF };
    return;
  }

  applyDefaults(tooltipConf, DEFAULT_TOOLTIP_CONF);
}

function normalizeValueLabelConf(props: JsonObject): void {
  const valueLabelConf = props.valueLabelConf;
  if (!isJsonObject(valueLabelConf)) {
    props.valueLabelConf = { ...DEFAULT_VALUE_LABEL_CONF };
    return;
  }

  applyDefaults(valueLabelConf, DEFAULT_VALUE_LABEL_CONF);
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeRadarChartProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeEntryAnimation(props);
  normalizeMargin(props);
  normalizeNumericProps(props);
  normalizeLegendConf(props);
  normalizeAxisConf(props);
  normalizeLabelConf(props);
  normalizeTickConf(props);
  normalizeSeriesConf(props);
  normalizeTooltipConf(props);
  normalizeValueLabelConf(props);
  normalizeEventConfigures(props);

  return props;
}
