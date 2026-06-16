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

function normalizeValue(value: JsonValue | undefined): number | "-" {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "-") {
      return "-";
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return "-";
}

function createDefaultDatasource(): JsonObject {
  return {
    sourceType: "constant",
    fieldMode: "multiple",
    constantDataType: "table",
    constantTableColumns: [
      { type: "string", key: "x" },
      { type: "string", key: "y" },
      { type: "number", key: "value" },
    ],
    fieldMappings: [
      { key: "x", mapFields: [{ path: "x", label: "x", deleted: false }] },
      { key: "y", mapFields: [{ path: "y", label: "y", deleted: false }] },
      { key: "value", mapFields: [{ path: "value", label: "value", deleted: false }] },
    ],
    constantData: [
      { x: "12a", y: "Saturday", value: 5 },
      { x: "1a", y: "Saturday", value: 1 },
      { x: "2a", y: "Saturday", value: 0 },
      { x: "3a", y: "Saturday", value: 0 },
      { x: "4a", y: "Saturday", value: 0 },
      { x: "12a", y: "Friday", value: 9 },
      { x: "1a", y: "Friday", value: 3 },
      { x: "2a", y: "Friday", value: 5 },
      { x: "3a", y: "Friday", value: 7 },
      { x: "4a", y: "Friday", value: 2 },
      { x: "12a", y: "Thursday", value: 8 },
      { x: "1a", y: "Thursday", value: 6 },
      { x: "2a", y: "Thursday", value: 4 },
      { x: "3a", y: "Thursday", value: 3 },
      { x: "4a", y: "Thursday", value: 1 },
      { x: "12a", y: "Wednesday", value: 4 },
      { x: "1a", y: "Wednesday", value: 7 },
      { x: "2a", y: "Wednesday", value: 9 },
      { x: "3a", y: "Wednesday", value: 2 },
      { x: "4a", y: "Wednesday", value: 6 },
    ],
  };
}

function normalizeDatasourceFromData(props: JsonObject): void {
  const aiData = props.data;
  if (!Array.isArray(aiData)) {
    return;
  }

  const normalizedData: JsonObject[] = [];
  for (const item of aiData) {
    if (!isJsonObject(item)) {
      continue;
    }

    normalizedData.push({
      x: asString(item.x, ""),
      y: asString(item.y, ""),
      value: normalizeValue(item.value),
    });
  }

  props.datasource = {
    sourceType: "constant",
    fieldMode: "multiple",
    constantDataType: "table",
    constantTableColumns: [
      { type: "string", key: "x" },
      { type: "string", key: "y" },
      { type: "number", key: "value" },
    ],
    fieldMappings: [
      { key: "x", mapFields: [{ path: "x", label: "x", deleted: false }] },
      { key: "y", mapFields: [{ path: "y", label: "y", deleted: false }] },
      { key: "value", mapFields: [{ path: "value", label: "value", deleted: false }] },
    ],
    constantData: normalizedData,
  };
}

function ensureDatasourceStructure(props: JsonObject): void {
  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = createDefaultDatasource();
    props.datasource = datasource;
    return;
  }

  datasource.sourceType = "constant";
  datasource.fieldMode = "multiple";
  datasource.constantDataType = "table";

  if (!Array.isArray(datasource.constantTableColumns) || datasource.constantTableColumns.length === 0) {
    datasource.constantTableColumns = [
      { type: "string", key: "x" },
      { type: "string", key: "y" },
      { type: "number", key: "value" },
    ];
  }

  if (!Array.isArray(datasource.fieldMappings) || datasource.fieldMappings.length === 0) {
    datasource.fieldMappings = [
      { key: "x", mapFields: [{ path: "x", label: "x", deleted: false }] },
      { key: "y", mapFields: [{ path: "y", label: "y", deleted: false }] },
      { key: "value", mapFields: [{ path: "value", label: "value", deleted: false }] },
    ];
  }

  if (!Array.isArray(datasource.constantData) || datasource.constantData.length === 0) {
    datasource.constantData = createDefaultDatasource().constantData;
  }
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

function normalizeEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = {
      type: "",
      isShow: false,
    };
    return;
  }

  if (typeof entryAnimiation.isShow !== "boolean") {
    entryAnimiation.isShow = false;
  }
  if (typeof entryAnimiation.type !== "string") {
    entryAnimiation.type = "";
  }
}

function normalizeMarginConf(props: JsonObject): void {
  const marginConf = props.marginConf;
  if (!isJsonObject(marginConf)) {
    props.marginConf = {
      top: 20,
      left: 45,
      bottom: 15,
      right: 20,
    };
    return;
  }

  marginConf.top = asNumber(marginConf.top, 20);
  marginConf.left = asNumber(marginConf.left, 45);
  marginConf.bottom = asNumber(marginConf.bottom, 15);
  marginConf.right = asNumber(marginConf.right, 20);
}

function normalizeXAxisConf(props: JsonObject): void {
  const xAxisConf = props.XAxisConf;
  if (!isJsonObject(xAxisConf)) {
    props.XAxisConf = {
      show: true,
      position: "bottom",
      name: "",
      nameTextStyle: {
        color: "#e6f7ff",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#ffffff",
          width: 1,
          type: "solid",
        },
      },
      axisTick: {
        show: false,
        inside: false,
        length: 5,
        lineStyle: {
          color: "#ffffff",
          width: 1,
          type: "solid",
        },
      },
      axisLabel: {
        show: true,
        inside: false,
        rotate: 0,
        color: "#e6f7ff",
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
        fontSize: 12,
        align: "center",
        margin: 8,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#e6f7ff",
          width: 1,
          type: "dashed",
        },
      },
    };
    return;
  }

  if (typeof xAxisConf.show !== "boolean") {
    xAxisConf.show = true;
  }
  xAxisConf.position = asString(xAxisConf.position, "bottom");
  xAxisConf.name = asString(xAxisConf.name, "");
}

function normalizeYAxisConf(props: JsonObject): void {
  const yAxisConf = props.YAxisConf;
  if (!isJsonObject(yAxisConf)) {
    props.YAxisConf = {
      show: true,
      position: "left",
      name: "",
      nameTextStyle: {
        color: "#e6f7ff",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#ffffff",
          width: 1,
          type: "solid",
        },
      },
      axisTick: {
        show: false,
        inside: false,
        length: 5,
        lineStyle: {
          color: "#ffffff",
          width: 1,
          type: "solid",
        },
      },
      axisLabel: {
        show: true,
        inside: false,
        rotate: 0,
        color: "#e6f7ff",
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
        fontSize: 12,
        align: "center",
        margin: 8,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#e6f7ff",
          width: 1,
          type: "dashed",
        },
      },
    };
    return;
  }

  if (typeof yAxisConf.show !== "boolean") {
    yAxisConf.show = true;
  }
  yAxisConf.position = asString(yAxisConf.position, "left");
  yAxisConf.name = asString(yAxisConf.name, "");
}

const DEFAULT_TOOLTIP_CONF: JsonObject = {
  show: true,
  backgroundColor: "rgba(3,16,31,0.92)",
  color: "#ffffff",
  fontSize: 14,
  padding: 10,
  fontFamily: "Microsoft YaHei",
  fontWeight: "normal",
  fontStyle: "normal",
};

function normalizeTooltipConf(props: JsonObject): void {
  const tooltipConf = props.tooltipConf;
  if (!isJsonObject(tooltipConf)) {
    props.tooltipConf = { ...DEFAULT_TOOLTIP_CONF };
    return;
  }

  applyDefaults(tooltipConf, DEFAULT_TOOLTIP_CONF);
}

function normalizeVisualMappingConf(props: JsonObject): void {
  const visualMappingConf = props.visualMappingConf;
  if (!isJsonObject(visualMappingConf)) {
    props.visualMappingConf = {
      show: true,
      orient: "vertical",
      left: "right",
      top: "center",
      min: 0,
      max: 10,
      calculable: true,
      realtime: true,
      inverse: false,
      precision: 0,
      itemWidth: 20,
      itemHeight: 140,
      text: ["高", "低"],
      textStyle: {
        color: "#e6f7ff",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        fontFamily: "serif",
      },
      inRange: {
        color: [
          "#313695",
          "#4575b4",
          "#74add1",
          "#abd9e9",
          "#e0f3f8",
          "#ffffbf",
          "#fee090",
          "#fdae61",
          "#f46d43",
          "#d73027",
          "#a50026",
        ],
      },
    };
    return;
  }

  if (typeof visualMappingConf.show !== "boolean") {
    visualMappingConf.show = true;
  }
  visualMappingConf.min = asNumber(visualMappingConf.min, 0);
  visualMappingConf.max = asNumber(visualMappingConf.max, 10);
}

function normalizeHighlightConf(props: JsonObject): void {
  const highlightConf = props.highlightConf;
  if (!isJsonObject(highlightConf)) {
    props.highlightConf = {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    };
    return;
  }

  if (!isJsonObject(highlightConf.itemStyle)) {
    highlightConf.itemStyle = {
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, 0.5)",
      borderColor: "#ffffff",
      borderWidth: 1,
    };
  }
}

function normalizeLabelConf(props: JsonObject): void {
  const labelConf = props.labelConf;
  if (!isJsonObject(labelConf)) {
    props.labelConf = {
      show: false,
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "normal",
      fontStyle: "normal",
      fontFamily: "serif",
      formatter: "{c}",
    };
    return;
  }

  if (typeof labelConf.show !== "boolean") {
    labelConf.show = false;
  }
  labelConf.formatter = asString(labelConf.formatter, "{c}");
}

function normalizeEventConfigures(props: JsonObject): void {
  if (!Array.isArray(props.eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeHeatMapProps(props: JsonObject): JsonObject {
  normalizeDatasourceFromData(props);
  ensureDatasourceStructure(props);
  normalizeEntryAnimation(props);
  normalizeMarginConf(props);
  normalizeXAxisConf(props);
  normalizeYAxisConf(props);
  normalizeTooltipConf(props);
  normalizeVisualMappingConf(props);
  normalizeHighlightConf(props);
  normalizeLabelConf(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "热力图");

  return props;
}
