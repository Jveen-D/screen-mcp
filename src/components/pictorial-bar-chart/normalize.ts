import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_DATA: JsonObject[] = [
  { s: 1, x: "系列一", y: "120.2" },
  { s: 1, x: "系列二", y: 195 },
  { s: 1, x: "系列三", y: 60 },
  { s: 1, x: "系列四", y: 96 },
  { s: 1, x: "系列五", y: 163 },
];

const DEFAULT_FIELD_MAPPINGS: JsonObject[] = [
  {
    key: "series",
    mapFields: [{ path: "s", deleted: false, label: "s" }],
  },
  {
    key: "value",
    mapFields: [{ path: "y", deleted: false, label: "y" }],
  },
  {
    key: "type",
    mapFields: [{ path: "x", deleted: false, label: "x" }],
  },
];

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_GLOBAL_CONF: JsonObject = {
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  animation: true,
  animationType: true,
  animationDuration: 800,
  margin: {
    top: 40,
    bottom: 60,
    left: 50,
    right: 10,
  },
  barConf: {
    innerMargin: -0.5,
    outerMargin: 0,
    overlap: 1,
    svgPath: "M66,0 C66,85.625 88,135.625 132,150 L0,150 C45.3894737,135 67.3894737,85 66,0 Z",
    svgWidth: 1,
    svgHeight: 1,
    barBackgroundColor: "rgba(244,58,46,0.1)",
    repeat: true,
  },
  labelConf: {
    show: true,
    fontSize: 10,
    fontColor: "rgba(255,255,255,1)",
    offsetY: -10,
    precision: 0,
  },
};

const DEFAULT_AXIS_LABEL_CONF: JsonObject = {
  show: true,
  inside: false,
  rotate: 0,
  fontColor: "rgba(255,255,255,1)",
  fontSize: 10,
};

const DEFAULT_AXIS_TICK_CONF: JsonObject = {
  show: false,
  inside: false,
  length: 2,
  width: 1,
  lineType: "solid",
  color: "rgba(255,255,255,1)",
  splitNumber: 4,
};

const DEFAULT_AXIS_LINE_CONF: JsonObject = {
  show: true,
  width: 1,
  lineType: "solid",
  color: "rgba(255,255,255,1)",
};

const DEFAULT_SPLIT_LINE_CONF: JsonObject = {
  show: false,
  width: 1,
  lineType: "dashed",
  color: "rgba(255,255,255,0.1)",
};

const DEFAULT_X_AXIS_CONF: JsonObject = {
  show: true,
  name: "",
  nameOffset: 8,
  nameColor: "rgba(255,255,255,1)",
  nameFontSize: 8,
  axisLabelConf: { ...DEFAULT_AXIS_LABEL_CONF, fontSize: 10 },
  axisTickConf: { ...DEFAULT_AXIS_TICK_CONF },
  axisLineConf: { ...DEFAULT_AXIS_LINE_CONF },
  splitLineConf: { ...DEFAULT_SPLIT_LINE_CONF },
};

const DEFAULT_Y_AXIS_CONF: JsonObject = {
  show: true,
  name: "单位",
  nameOffset: 8,
  nameColor: "rgba(255,255,255,1)",
  nameFontSize: 10,
  axisLabelConf: { ...DEFAULT_AXIS_LABEL_CONF, fontSize: 8 },
  axisTickConf: {
    ...DEFAULT_AXIS_TICK_CONF,
    show: true,
    inside: true,
    length: 4,
    width: 0.5,
  },
  axisLineConf: { ...DEFAULT_AXIS_LINE_CONF },
  splitLineConf: {
    ...DEFAULT_SPLIT_LINE_CONF,
    show: true,
    color: "rgba(230,247,255,0.25)",
  },
};

const DEFAULT_LEGEND_CONF: JsonObject = {
  show: false,
  orient: "horizontal",
  icon: "rect",
  iconWidth: 10,
  iconHeight: 10,
  precision: 0,
  fontSize: 10,
  fontColor: "rgba(255,255,255,1)",
  position: {
    top: "bottom",
    left: "center",
  },
};

const DEFAULT_GUIDE_LINE_CONF: JsonObject = {
  show: false,
  valueType: "max",
  customValue: 0,
  lineColor: "rgba(244,58,46,1)",
  lineType: "dashed",
  showText: false,
  textName: "最大值",
  textColor: "rgba(244,58,46,1)",
  textSize: 12,
};

const DEFAULT_SERIES_CONF: JsonObject = {
  __seriesType: "__default",
  matchName: "",
  fillColor: "linear-gradient(90deg, rgba(6,80,239,0.4) 0%, rgba(1,207,248,0.7) 100%)",
  suffix: "",
  suffixColor: "rgba(230,247,255,1)",
  suffixSize: 12,
  iconImg: "",
  iconWidth: 10,
  iconHeight: 10,
  iconOffsetY: 0,
  borderColor: "rgba(30,231,231,1)",
  borderWidth: 1.5,
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
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

function applyDefaults(target: JsonObject, defaults: JsonObject): void {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) {
      target[key] = defaults[key] as JsonValue;
    } else if (isJsonObject(target[key]) && isJsonObject(defaults[key])) {
      applyDefaults(target[key] as JsonObject, defaults[key] as JsonObject);
    }
  }
}

function normalizeDataItem(item: JsonValue, index: number): JsonObject {
  if (!isJsonObject(item)) {
    return { s: 1, x: `系列${index + 1}`, y: 0 };
  }

  const series = item.series ?? item.s;
  const type = item.type ?? item.x;
  const value = item.value ?? item.y;

  return {
    s: series ?? 1,
    x: asString(type, `系列${index + 1}`),
    y: asNumber(value, 0),
  };
}

function normalizeConstantData(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_DATA.map((item, index) => normalizeDataItem(item as JsonValue, index));
  }

  return value.map(normalizeDataItem);
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

function normalizeGlobalConf(props: JsonObject): void {
  const globalConf = props.globalConf;
  if (!isJsonObject(globalConf)) {
    props.globalConf = { ...DEFAULT_GLOBAL_CONF };
    return;
  }

  applyDefaults(globalConf, DEFAULT_GLOBAL_CONF);

  const barConf = globalConf.barConf;
  if (isJsonObject(barConf)) {
    applyDefaults(barConf, DEFAULT_GLOBAL_CONF.barConf as JsonObject);
  } else {
    globalConf.barConf = { ...(DEFAULT_GLOBAL_CONF.barConf as JsonObject) };
  }

  const labelConf = globalConf.labelConf;
  if (isJsonObject(labelConf)) {
    applyDefaults(labelConf, DEFAULT_GLOBAL_CONF.labelConf as JsonObject);
  } else {
    globalConf.labelConf = { ...(DEFAULT_GLOBAL_CONF.labelConf as JsonObject) };
  }

  const margin = globalConf.margin;
  if (isJsonObject(margin)) {
    applyDefaults(margin, DEFAULT_GLOBAL_CONF.margin as JsonObject);
  } else {
    globalConf.margin = { ...(DEFAULT_GLOBAL_CONF.margin as JsonObject) };
  }
}

function normalizeAxisConf(props: JsonObject, key: "XAxisConf" | "YAxisConf", defaults: JsonObject): void {
  const axisConf = props[key];
  if (!isJsonObject(axisConf)) {
    props[key] = { ...defaults };
    return;
  }

  applyDefaults(axisConf, defaults);

  const axisLabelConf = axisConf.axisLabelConf;
  if (isJsonObject(axisLabelConf)) {
    applyDefaults(axisLabelConf, defaults.axisLabelConf as JsonObject);
  } else {
    axisConf.axisLabelConf = { ...(defaults.axisLabelConf as JsonObject) };
  }

  const tickConf = axisConf.axisTickConf;
  if (isJsonObject(tickConf)) {
    applyDefaults(tickConf, defaults.axisTickConf as JsonObject);
  } else {
    axisConf.axisTickConf = { ...(defaults.axisTickConf as JsonObject) };
  }

  const lineConf = axisConf.axisLineConf;
  if (isJsonObject(lineConf)) {
    applyDefaults(lineConf, defaults.axisLineConf as JsonObject);
  } else {
    axisConf.axisLineConf = { ...(defaults.axisLineConf as JsonObject) };
  }

  const splitConf = axisConf.splitLineConf;
  if (isJsonObject(splitConf)) {
    applyDefaults(splitConf, defaults.splitLineConf as JsonObject);
  } else {
    axisConf.splitLineConf = { ...(defaults.splitLineConf as JsonObject) };
  }
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

  if (legendConf.orient !== "horizontal" && legendConf.orient !== "vertical") {
    legendConf.orient = "horizontal";
  }
}

function normalizeGuideLineConf(props: JsonObject): void {
  const guideLineConf = props.guideLineConf;
  if (!isJsonObject(guideLineConf)) {
    props.guideLineConf = { ...DEFAULT_GUIDE_LINE_CONF };
    return;
  }

  applyDefaults(guideLineConf, DEFAULT_GUIDE_LINE_CONF);

  if (guideLineConf.valueType !== "max" && guideLineConf.valueType !== "custom") {
    guideLineConf.valueType = "max";
  }
  if (guideLineConf.lineType !== "solid" && guideLineConf.lineType !== "dashed") {
    guideLineConf.lineType = "dashed";
  }
}

function normalizeSeriesConfs(props: JsonObject): void {
  const seriesConfs = props.seriesConfs;
  if (!Array.isArray(seriesConfs) || seriesConfs.length === 0) {
    props.seriesConfs = [{ ...DEFAULT_SERIES_CONF }];
    return;
  }

  const normalized = seriesConfs.map((item) => {
    if (!isJsonObject(item)) {
      return { ...DEFAULT_SERIES_CONF };
    }
    return { ...DEFAULT_SERIES_CONF, ...item };
  });

  const hasDefault = normalized.some((item) => item.__seriesType === "__default");
  if (!hasDefault) {
    normalized.push({ ...DEFAULT_SERIES_CONF });
  }

  props.seriesConfs = normalized as JsonValue;
}

function normalizeNumericProps(props: JsonObject): void {
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizePictorialBarChartProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeEntryAnimation(props);
  normalizeNumericProps(props);
  normalizeGlobalConf(props);
  normalizeAxisConf(props, "XAxisConf", DEFAULT_X_AXIS_CONF);
  normalizeAxisConf(props, "YAxisConf", DEFAULT_Y_AXIS_CONF);
  normalizeLegendConf(props);
  normalizeGuideLineConf(props);
  normalizeSeriesConfs(props);
  normalizeEventConfigures(props);

  return props;
}
